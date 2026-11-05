<#
  Gringotts-Sync : envoie les données de l'addon Gringotts vers le repo GitHub, chiffrées.

  Usage (via Installer.bat) :
    -Setup     configuration guidée (dossier WoW, jeton GitHub, mot de passe), puis premier envoi
    -Once      un envoi immédiat (Envoyer.bat) : lit le fichier de l'addon, chiffre, envoie
    -Apply     copie le Dash.lua téléchargé depuis le dashboard dans le dossier de l'addon (Appliquer.bat)
    -Watch     option : reste ouvert et envoie à chaque /reload (non utilisé par défaut)
    -OutDir X  écrit les fichiers chiffrés dans X au lieu de les envoyer (test hors ligne)

  Compatible Windows PowerShell 5.1 (aucune installation requise).
#>
param(
  [switch]$Setup,
  [switch]$Watch,
  [switch]$Once,
  [switch]$Apply,
  [string]$OutDir = "",
  [string]$File = ""
)

$ErrorActionPreference = "Stop"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$Home2   = Join-Path $env:APPDATA "GringottsSync"
$CfgPath = Join-Path $Home2 "config.json"
$TokPath = Join-Path $Home2 "token.dat"
$PwdPath = Join-Path $Home2 "pass.dat"
$StPath  = Join-Path $Home2 "state.json"
$LogPath = Join-Path $Home2 "sync.log"
$KDF_ITER = 200000
New-Item -ItemType Directory -Force -Path $Home2 | Out-Null

function Log([string]$m) {
  $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m
  Write-Host $line
  try {
    Add-Content -Path $LogPath -Value $line -Encoding UTF8
    if ((Get-Item $LogPath).Length -gt 200KB) { Get-Content $LogPath -Tail 200 | Set-Content $LogPath -Encoding UTF8 }
  } catch {}
}

# ---------- Lecture d'une chaîne Lua dans SavedVariables (octets bruts, échappements Lua complets) ----------
Add-Type -TypeDefinition @"
using System;
using System.Text;
public static class GtLua {
  // src : fichier lu en Latin-1 (1 octet = 1 caractère). Retourne les octets de la chaîne dépliée.
  public static byte[] Extract(string src, string key) {
    string marker = "[\"" + key + "\"] = \"";
    int i = src.IndexOf(marker, StringComparison.Ordinal);
    if (i < 0) return null;
    i += marker.Length;
    var o = new System.IO.MemoryStream();
    while (i < src.Length) {
      char c = src[i];
      if (c == '"') return o.ToArray();
      if (c != '\\') { o.WriteByte((byte)c); i++; continue; }
      i++; if (i >= src.Length) break;
      c = src[i];
      switch (c) {
        case 'n': o.WriteByte(10); i++; break;
        case 'r': o.WriteByte(13); i++; break;
        case 't': o.WriteByte(9);  i++; break;
        case 'a': o.WriteByte(7);  i++; break;
        case 'b': o.WriteByte(8);  i++; break;
        case 'f': o.WriteByte(12); i++; break;
        case 'v': o.WriteByte(11); i++; break;
        case '\n': o.WriteByte(10); i++; break;
        case '\r': o.WriteByte(10); i++; if (i < src.Length && src[i] == '\n') i++; break;
        case 'x': {
          i++; int n = 0, k = 0;
          while (k < 2 && i < src.Length && Uri.IsHexDigit(src[i])) { n = n * 16 + Convert.ToInt32(src[i].ToString(), 16); i++; k++; }
          o.WriteByte((byte)n); break; }
        case 'z': i++; while (i < src.Length && char.IsWhiteSpace(src[i])) i++; break;
        default:
          if (c >= '0' && c <= '9') {
            int n = 0, k = 0;
            while (k < 3 && i < src.Length && src[i] >= '0' && src[i] <= '9') { n = n * 10 + (src[i] - '0'); i++; k++; }
            o.WriteByte((byte)n);
          } else { o.WriteByte((byte)c); i++; }
          break;
      }
    }
    return null;
  }
}
"@

# ---------- Chiffrement : gzip -> AES-256-CBC + HMAC-SHA256 (clé = PBKDF2-SHA256 du mot de passe) ----------
function New-RandomBytes([int]$n) {
  $b = New-Object byte[] $n
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($b); $rng.Dispose()
  return $b
}
function Get-Keys([string]$pass, [byte[]]$salt) {
  $kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($pass, $salt, $KDF_ITER, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  $km = $kdf.GetBytes(64); $kdf.Dispose()
  $enc = New-Object byte[] 32; $mac = New-Object byte[] 32
  [Array]::Copy($km, 0, $enc, 0, 32); [Array]::Copy($km, 32, $mac, 0, 32)
  return @{ enc = $enc; mac = $mac }
}
function Protect-Bytes([byte[]]$plain, $keys) {
  $ms = New-Object System.IO.MemoryStream
  $gz = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionMode]::Compress, $true)
  $gz.Write($plain, 0, $plain.Length); $gz.Dispose()
  $zipped = $ms.ToArray(); $ms.Dispose()
  $iv = New-RandomBytes 16
  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
  $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
  $aes.Key = $keys.enc; $aes.IV = $iv
  $ct = $aes.CreateEncryptor().TransformFinalBlock($zipped, 0, $zipped.Length); $aes.Dispose()
  $both = New-Object byte[] ($iv.Length + $ct.Length)
  [Array]::Copy($iv, 0, $both, 0, $iv.Length); [Array]::Copy($ct, 0, $both, $iv.Length, $ct.Length)
  $h = New-Object System.Security.Cryptography.HMACSHA256(, $keys.mac)
  $mac = $h.ComputeHash($both); $h.Dispose()
  return ('{{"v":1,"iv":"{0}","ct":"{1}","mac":"{2}"}}' -f [Convert]::ToBase64String($iv), [Convert]::ToBase64String($ct), [Convert]::ToBase64String($mac))
}

# ---------- Secrets (chiffrés par Windows pour ton compte utilisateur uniquement) ----------
function Save-Secret([string]$path, [System.Security.SecureString]$s) { ConvertFrom-SecureString $s | Set-Content -Path $path -Encoding ASCII }
function Read-Secret([string]$path) {
  if (-not (Test-Path $path)) { return $null }
  $s = (Get-Content $path -Raw).Trim() | ConvertTo-SecureString
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

# ---------- GitHub (API Contents) ----------
function Gh-Headers([string]$token) { $token = ($token -replace "[^\x21-\x7E]", ""); return @{ Authorization = "Bearer $token"; "User-Agent" = "Gringotts-Sync"; Accept = "application/vnd.github+json" } }
function Gh-GetSha($cfg, [string]$token, [string]$path) {
  try {
    $r = Invoke-RestMethod -Method Get -Uri ("https://api.github.com/repos/{0}/contents/{1}?ref={2}" -f $cfg.repo, $path, $cfg.branch) -Headers (Gh-Headers $token)
    return $r.sha
  } catch {
    if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) { return $null }
    throw
  }
}
function Gh-Put($cfg, [string]$token, [string]$path, [string]$text, [string]$msg) {
  $body = @{ message = $msg; branch = $cfg.branch; content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($text)) }
  $sha = Gh-GetSha $cfg $token $path
  if ($sha) { $body.sha = $sha }
  Invoke-RestMethod -Method Put -Uri ("https://api.github.com/repos/{0}/contents/{1}" -f $cfg.repo, $path) -Headers (Gh-Headers $token) -ContentType "application/json" -Body ($body | ConvertTo-Json -Compress) | Out-Null
}
function Gh-GetText($cfg, [string]$token, [string]$path) {
  try {
    $h = Gh-Headers $token; $h.Accept = "application/vnd.github.raw+json"
    $r = Invoke-WebRequest -UseBasicParsing -Method Get -Uri ("https://api.github.com/repos/{0}/contents/{1}?ref={2}" -f $cfg.repo, $path, $cfg.branch) -Headers $h
    return [string]$r.Content
  } catch {
    if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) { return $null }
    throw
  }
}

# ---------- Fichier SavedVariables ----------
function Find-SavedVariables([string]$root) {
  if (-not (Test-Path $root)) { return @() }
  return @(Get-ChildItem -Path $root -Recurse -Filter "Gringotts.lua" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match "SavedVariables" } | Sort-Object LastWriteTime -Descending)
}
function Read-Export([string]$svPath) {
  $bytes = [IO.File]::ReadAllBytes($svPath)
  $lat = [Text.Encoding]::GetEncoding(28591).GetString($bytes)
  $raw = [GtLua]::Extract($lat, "syncText")
  if (-not $raw) { return $null }
  return [Text.Encoding]::UTF8.GetString($raw)
}

# ---------- Un cycle de synchronisation ----------
function Sync-Once($cfg, $token, [string]$pass) {
  $sv = if ($File) { $File } else { $cfg.sv }
  if (-not (Test-Path $sv)) { Log "Fichier introuvable : $sv"; return $false }
  $text = Read-Export $sv
  if (-not $text) { Log "Aucun export dans le fichier : lance un scan puis /reload en jeu (ou /gt sync puis /reload)."; return $false }
  $lines = $text -split "`n"
  if ($lines[0] -notmatch "^WFC1;(\d+);") { Log "Export illisible (en-tête WFC1 absent)."; return $false }
  $t = [int64]$Matches[1]
  $day = [DateTimeOffset]::FromUnixTimeSeconds($t).LocalDateTime.ToString("yyyy-MM-dd")
  $ageMin = [int](([DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $t) / 60)
  if ($ageMin -gt 60) { Log ("Attention : l'export date d'il y a {0} h {1} min. As-tu fait /gt sync puis /reload (ou le bouton Recharger) après ton scan ?" -f [math]::Floor($ageMin / 60), ($ageMin % 60)) }

  # Rien de nouveau ? (hors horodatage de la 1re ligne)
  $body = ($lines | Select-Object -Skip 1) -join "`n"
  $sha = [BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($body))).Replace("-", "")
  $state = @{ hash = ""; salt = "" }
  if (Test-Path $StPath) { try { $o = Get-Content $StPath -Raw | ConvertFrom-Json; $state.hash = [string]$o.hash; $state.salt = [string]$o.salt } catch {} }
  if ($state.hash -eq $sha -and -not $OutDir) { Log "Export inchangé, rien à envoyer."; return $true }

  # Sel (public) : un seul pour tous les fichiers, publié dans data/meta.json
  $newSalt = $false
  if (-not $cfg.salt) { $cfg | Add-Member -NotePropertyName salt -NotePropertyValue ([Convert]::ToBase64String((New-RandomBytes 16))) -Force; $newSalt = $true }
  $keys = Get-Keys $pass ([Convert]::FromBase64String($cfg.salt))
  if ($newSalt) { $cfg | ConvertTo-Json | Set-Content -Path $CfgPath -Encoding UTF8 }

  $priceLines = @($lines[0]) + @($lines | Where-Object { $_ -match "^P;" })
  $fullJson   = Protect-Bytes ([Text.Encoding]::UTF8.GetBytes($text)) $keys
  $priceJson  = Protect-Bytes ([Text.Encoding]::UTF8.GetBytes(($priceLines -join "`n"))) $keys
  $metaJson   = '{{"v":1,"it":{0},"salt":"{1}"}}' -f $KDF_ITER, $cfg.salt

  if ($OutDir) {
    New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
    Set-Content -Path (Join-Path $OutDir "latest.json") -Value $fullJson -Encoding ASCII
    Set-Content -Path (Join-Path $OutDir ("p-{0}.json" -f $day)) -Value $priceJson -Encoding ASCII
    Set-Content -Path (Join-Path $OutDir "meta.json") -Value $metaJson -Encoding ASCII
    Log "Fichiers chiffrés écrits dans $OutDir ($day, $($lines.Count) lignes)."
    return $true
  }

  # Index des jours disponibles
  $days = @()
  $idx = Gh-GetText $cfg $token "data/index.json"
  if ($idx) { try { $days = @(($idx | ConvertFrom-Json).days) } catch {} }
  if ($days -notcontains $day) { $days = @($days + $day | Sort-Object -Unique) }

  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  Gh-Put $cfg $token ("data/p-{0}.json" -f $day) $priceJson ("prix {0}" -f $day)
  Gh-Put $cfg $token "data/latest.json" $fullJson ("export {0}" -f $stamp)
  if ($newSalt -or $state.salt -ne $cfg.salt) { Gh-Put $cfg $token "data/meta.json" $metaJson "meta" }
  $indexJson = '{{"t":{0},"days":[{1}]}}' -f $t, (($days | ForEach-Object { '"' + $_ + '"' }) -join ",")
  Gh-Put $cfg $token "data/index.json" $indexJson "index"

  @{ hash = $sha; salt = $cfg.salt } | ConvertTo-Json | Set-Content -Path $StPath -Encoding UTF8
  Log ("Envoyé : export du {0} ({1} lignes, {2} prix)." -f $day, $lines.Count, ($priceLines.Count - 1))
  return $true
}

# ---------- Configuration guidée ----------
function Run-Setup {
  Write-Host ""
  Write-Host "=== Gringotts-Sync v1.11.3 : configuration ===" -ForegroundColor Yellow
  $cfg = [pscustomobject]@{ sv = ""; repo = "Zazahkel-Gringotts/Gringotts"; branch = "main"; salt = "" }

  # 1. Dossier WoW
  $cands = @("C:\Program Files (x86)\World of Warcraft", "C:\Program Files\World of Warcraft", "D:\World of Warcraft", "C:\Games\World of Warcraft", "D:\Games\World of Warcraft")
  $found = @()
  foreach ($c in $cands) { $found += Find-SavedVariables $c }
  if (-not $found.Count) {
    Write-Host "Dossier d'installation de WoW introuvable automatiquement."
    $root = Read-Host "Colle le chemin du dossier contenant WoW (ex. D:\Jeux\World of Warcraft)"
    $found = Find-SavedVariables $root.Trim('"')
  }
  if (-not $found.Count) { throw "Aucun fichier SavedVariables\Gringotts.lua trouvé. Connecte-toi en jeu avec l'addon v1.10.0, tape /reload, puis relance." }
  if ($found.Count -gt 1) {
    for ($i = 0; $i -lt $found.Count; $i++) { Write-Host ("  [{0}] {1}  ({2})" -f $i, $found[$i].FullName, $found[$i].LastWriteTime) }
    $n = [int](Read-Host "Numéro du bon fichier (le plus récent est [0])")
    $cfg.sv = $found[$n].FullName
  } else { $cfg.sv = $found[0].FullName }
  Write-Host "Fichier surveillé : $($cfg.sv)" -ForegroundColor Green

  # 2. Jeton GitHub
  Write-Host ""
  Write-Host "Jeton GitHub (fine-grained) limité au repo Gringotts, permission Contents : Read and write."
  $tok = Read-Host "Colle le jeton (rien ne s'affiche)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($tok)
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr); [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  $token = ($plain -replace "[^\x21-\x7E]", "")
  Write-Host ("Jeton lu : {0} caractères (début : {1})" -f $token.Length, $token.Substring(0, [Math]::Min(11, $token.Length)))
  if ($token.Length -lt 20) { throw "Jeton vide ou trop court. Relance, puis colle le jeton complet (clic droit ou Ctrl+V)." }
  Save-Secret $TokPath (ConvertTo-SecureString $token -AsPlainText -Force)
  try { Invoke-RestMethod -Uri ("https://api.github.com/repos/{0}" -f $cfg.repo) -Headers (Gh-Headers $token) | Out-Null; Write-Host "Accès GitHub OK." -ForegroundColor Green }
  catch {
    $code = ""; if ($_.Exception.Response) { $code = " (HTTP " + [int]$_.Exception.Response.StatusCode + ")" }
    throw ("Échec de l'accès au repo {0}{1} : [{2}] {3}" -f $cfg.repo, $code, $_.Exception.GetType().Name, $_.Exception.Message)
  }

  # 3. Mot de passe de chiffrement
  Write-Host ""
  Write-Host "Mot de passe du dashboard : il chiffre tes données. Sans lui, personne ne peut les lire. Tu le saisiras aussi sur le site."
  $p1 = Read-Host "Mot de passe" -AsSecureString
  $p2 = Read-Host "Confirme le mot de passe" -AsSecureString
  $b1 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p1))
  $b2 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p2))
  if ($b1 -ne $b2 -or $b1.Length -lt 8) { throw "Les mots de passe diffèrent, ou font moins de 8 caractères." }
  Save-Secret $PwdPath $p1
  $cfg.salt = [Convert]::ToBase64String((New-RandomBytes 16))
  $cfg | ConvertTo-Json | Set-Content -Path $CfgPath -Encoding UTF8
  if (Test-Path $StPath) { Remove-Item $StPath -Force }

  Write-Host ""
  Write-Host "Premier envoi..." -ForegroundColor Yellow
  $cfg2 = Get-Content $CfgPath -Raw | ConvertFrom-Json
  try { [void](Sync-Once $cfg2 $token $b1) } catch { Log ("Erreur : " + $_.Exception.Message) }
  Write-Host ""
  Write-Host "Configuration terminée. Pour envoyer tes données ensuite : double-clique Envoyer.bat (après un /reload en jeu)." -ForegroundColor Green
  Write-Host "Journal : $LogPath"
}

# ---------- Application manuelle de Dash.lua (si le navigateur ne peut pas écrire dans le dossier de l'addon) ----------
function Run-Apply {
  if (-not (Test-Path $CfgPath)) { throw "Configuration absente : lance Installer.bat." }
  $cfg = Get-Content $CfgPath -Raw | ConvertFrom-Json
  $i = $cfg.sv.IndexOf("\WTF\", [StringComparison]::OrdinalIgnoreCase)
  if ($i -lt 0) { throw "Chemin SavedVariables inattendu : $($cfg.sv)" }
  $addon = Join-Path $cfg.sv.Substring(0, $i) "Interface\AddOns\Gringotts"
  if (-not (Test-Path (Join-Path $addon "Gringotts.toc"))) { throw "Dossier de l'addon introuvable : $addon" }
  $dl = $null
  try { $dl = (New-Object -ComObject Shell.Application).NameSpace("shell:Downloads").Self.Path } catch {}
  if (-not $dl) { $dl = Join-Path $env:USERPROFILE "Downloads" }
  $f = Get-ChildItem -Path $dl -Filter "Dash*.lua" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $f) { throw "Aucun Dash.lua dans $dl : clique d'abord sur « Télécharger Dash.lua » dans le dashboard." }
  Copy-Item -Path $f.FullName -Destination (Join-Path $addon "Dash.lua") -Force
  Get-ChildItem -Path $dl -Filter "Dash*.lua" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  Log ("Dash.lua copié dans {0}. Tape /reload en jeu." -f $addon)
}

# ---------- Boucle de surveillance ----------
function Run-Watch {
  $cfg = Get-Content $CfgPath -Raw | ConvertFrom-Json
  $token = Read-Secret $TokPath; $pass = Read-Secret $PwdPath
  if (-not $token -or -not $pass) { throw "Configuration absente : lance Installer.bat." }
  # une seule instance
  $created = $false
  $mtx = New-Object System.Threading.Mutex($true, "Global\GringottsSyncWatch", [ref]$created)
  if (-not $created) { Log "Déjà en cours."; return }
  Log "Surveillance de $($cfg.sv)"
  $last = [DateTime]::MinValue
  while ($true) {
    try {
      if (Test-Path $cfg.sv) {
        $fi = Get-Item $cfg.sv
        if ($fi.LastWriteTime -gt $last -and ((Get-Date) - $fi.LastWriteTime).TotalSeconds -gt 3) {
          $last = $fi.LastWriteTime
          [void](Sync-Once $cfg $token $pass)
        }
      }
    } catch { Log ("Erreur : " + $_.Exception.Message); Start-Sleep -Seconds 60 }
    Start-Sleep -Seconds 15
  }
}

if ($Setup) { Run-Setup; return }
if ($Apply) { Run-Apply; return }
if ($Watch) { Run-Watch; return }
if ($Once -or $OutDir -or (-not $Watch)) {
  $cfg = if (Test-Path $CfgPath) { Get-Content $CfgPath -Raw | ConvertFrom-Json } else { [pscustomobject]@{ sv = $File; repo = "Zazahkel-Gringotts/Gringotts"; branch = "main"; salt = "" } }
  $token = Read-Secret $TokPath; $pass = Read-Secret $PwdPath
  if ($env:GT_PASS) { $pass = $env:GT_PASS }
  if (-not $pass) { throw "Mot de passe absent : lance Installer.bat (ou définis GT_PASS pour un test)." }
  [void](Sync-Once $cfg $token $pass)
  return
}
