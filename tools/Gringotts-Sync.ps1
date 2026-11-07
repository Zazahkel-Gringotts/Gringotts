<#
  Gringotts-Sync : envoie les données de l'addon Gringotts vers le repo GitHub, chiffrées.

  Usage (via Installer.bat) :
    -Setup     configuration guidée (dossier WoW, jeton GitHub, mot de passe), puis premier envoi
    -Once      un envoi immédiat (Envoyer.bat) : lit le fichier de l'addon, chiffre, envoie
    -Prices    récupère les prix de l'HV via l'API Blizzard et les envoie au dashboard (remplace le scan HV)
    -Auto      avec -Prices : mode sans fenêtre ni question (tâche planifiée), erreurs écrites dans sync.log
    -Schedule  crée la tâche Windows « Gringotts - Prix HV » : un relevé des prix chaque jour à 19h30 (Planifier-HV.bat)
    -Unschedule supprime cette tâche
    -Compare   compare les prix de ton dernier export aux HV de l'API Blizzard (identifie ton HV)
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
  [switch]$Compare,
  [switch]$Prices,
  [switch]$Auto,
  [switch]$Schedule,
  [switch]$Unschedule,
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
  # Prix API du même jour (Prix-API.bat) : ils passent par-dessus les prix de l'export
  if (Test-Path $ApiLastPath) {
    $al = @(Get-Content $ApiLastPath -Encoding UTF8)
    if ($al.Count -gt 2 -and $al[0] -eq $day) {
      $apiP = @{}; foreach ($l in ($al | Select-Object -Skip 2)) { $f = $l.Split(";"); if ($f.Count -ge 2) { $apiP[$f[1]] = $l } }
      $priceLines = @($priceLines[0]) + @($priceLines | Select-Object -Skip 1 | Where-Object { $f = $_.Split(";"); -not $apiP.ContainsKey($f[1]) }) + @($apiP.Values)
    }
  }
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
  Write-Host "=== Gringotts-Sync v1.13.0 : configuration ===" -ForegroundColor Yellow
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


# ---------- Comparaison export <-> API Blizzard (identifie ton HV) ----------
function Run-Compare {
  if (-not (Test-Path $CfgPath)) { throw "Configuration absente : lance Installer.bat." }
  $cfg = Get-Content $CfgPath -Raw | ConvertFrom-Json
  $text = Read-Export $cfg.sv
  if (-not $text) { throw "Aucun export dans l'addon : fais /gt sync puis /reload en jeu." }
  $mine = @{}   # id -> prix en cuivre
  foreach ($ln in ($text -split "`n")) {
    $f = $ln.TrimEnd("`r").Split(";")
    if ($f[0] -eq "P" -and $f.Count -ge 5 -and [int64]$f[4] -gt 0 -and [int64]$f[2] -gt 0) { $mine[[int]$f[4]] = [int64]$f[2] }
  }
  if ($mine.Count -eq 0) { throw "Export sans identifiants d'objets : installe l'addon 1.12.3, /gt sync, /reload puis relance." }
  Write-Host ("Prix avec identifiant dans ton export : {0}" -f $mine.Count)
  $id = (Read-Host 'Client ID').Trim()
  $sec = Read-Host 'Client Secret' -AsSecureString
  $secPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()
  $tok = Invoke-RestMethod -Method Post -Uri 'https://oauth.battle.net/token' -Body @{grant_type='client_credentials'} `
    -Headers @{Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${id}:$secPlain"))}
  $secPlain = $null
  $ns = "dynamic-forever-eu"
  function Api([string]$path) {
    try { return (Invoke-WebRequest -UseBasicParsing -Uri "https://eu.api.blizzard.com${path}?namespace=${ns}&locale=fr_FR" -Headers @{Authorization = "Bearer $($tok.access_token)"}).Content } catch { return $null }
  }
  $ix = Api '/data/wow/ruleset/1/auctions/index'
  if (-not $ix) { throw "Index des HV illisible." }
  $ahs = [regex]::Matches($ix, '"name":"([^"]*)","id":(\d+)') | ForEach-Object { [pscustomobject]@{ id = $_.Groups[2].Value; name = $_.Groups[1].Value } }
  $res = @()
  foreach ($ah in $ahs) {
    $body = Api "/data/wow/ruleset/1/auctions/$($ah.id)/commodities"
    if (-not $body) { continue }
    $min = @{}
    foreach ($m in [regex]::Matches($body, '"item":\{"id":(\d+)\},"quantity":\d+,"unit_price":(\d+)')) {
      $k = [int]$m.Groups[1].Value
      if ($mine.ContainsKey($k)) { $v = [int64]$m.Groups[2].Value; if (-not $min.ContainsKey($k) -or $v -lt $min[$k]) { $min[$k] = $v } }
    }
    if ($min.Count -lt 10) { continue }
    $errs = @($min.Keys | ForEach-Object { [Math]::Abs($min[$_] - $mine[$_]) / [double]$mine[$_] } | Sort-Object)
    $med = $errs[[int][Math]::Floor($errs.Count / 2)]
    $near = @($errs | Where-Object { $_ -le 0.15 }).Count
    $res += [pscustomobject]@{ HV = $ah.id; Nom = $ah.name; Objets = $min.Count; ErreurMediane = [Math]::Round($med * 100, 1); Proches15pct = [Math]::Round(100 * $near / $errs.Count, 0) }
  }
  $out = Join-Path $Home2 "compare-hv.txt"
  $lines = @("Comparaison export / API Forever " + (Get-Date -Format s), "Objets de ton export avec identifiant : $($mine.Count)", "")
  $lines += ($res | Sort-Object ErreurMediane | Format-Table -AutoSize | Out-String -Width 200).TrimEnd().Split("`n")
  $lines += @("", "ErreurMediane = écart médian en % entre ton prix et le prix minimum de l'API ; Proches15pct = part des objets à moins de 15 %.")
  $lines | ForEach-Object { Write-Host $_ }
  $lines | Set-Content -Path $out -Encoding UTF8
  Write-Host ""; Write-Host "Rapport : $out"
}

# ---------- Prix de l'HV via l'API Blizzard (remplace le scan Auctionator) ----------
$IdsPath     = Join-Path $Home2 "ids.json"
$ApiIdPath   = Join-Path $Home2 "apiid.dat"
$ApiSecPath  = Join-Path $Home2 "apisec.dat"
$ApiLastPath = Join-Path $Home2 "api-last.txt"
$MissPath    = Join-Path $Home2 "ids-introuvables2.json"
$ItemsLogPath = Join-Path $Home2 "items-last.txt"

function Run-Prices {
  if (-not (Test-Path $CfgPath)) { throw "Configuration absente : lance Installer.bat." }
  $cfg = Get-Content $CfgPath -Raw | ConvertFrom-Json
  $token = Read-Secret $TokPath; $pass = Read-Secret $PwdPath
  if (-not $token -or -not $pass) { throw "Configuration absente : lance Installer.bat." }
  if (-not $cfg.salt) { throw "Aucun envoi encore fait : lance d'abord Envoyer.bat une fois." }
  $ah = if ($cfg.PSObject.Properties.Name -contains "ah" -and $cfg.ah) { [string]$cfg.ah } else { "110" }

  # Table nom -> identifiant d'objet : export local + mémoire des exports précédents
  $ids = @{}
  if (Test-Path $IdsPath) { try { (Get-Content $IdsPath -Raw -Encoding UTF8 | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $ids[$_.Name] = [int]$_.Value } } catch {} }
  $sv = if ($File) { $File } else { $cfg.sv }
  if (Test-Path $sv) {
    $text = Read-Export $sv
    if ($text) { foreach ($ln in ($text -split "`n")) { $f = $ln.TrimEnd("`r").Split(";"); if ($f[0] -eq "P" -and $f.Count -ge 5 -and [int]$f[4] -gt 0) { $ids[$f[1]] = [int]$f[4] } } }
  }
  if ($ids.Count -eq 0) { throw "Aucun identifiant d'objet connu : installe l'addon 1.12.3, fais /gt sync puis /reload en jeu, et relance." }
  $o = [ordered]@{}; foreach ($k in ($ids.Keys | Sort-Object)) { $o[$k] = $ids[$k] }
  $o | ConvertTo-Json | Set-Content -Path $IdsPath -Encoding UTF8

  # Identifiants de l'API Blizzard (mémorisés, chiffrés par Windows pour ton compte)
  $cid = Read-Secret $ApiIdPath; $csec = Read-Secret $ApiSecPath
  if ((-not $cid -or -not $csec) -and $Auto) { throw "Identifiants Blizzard absents : lance Prix-API.bat une fois à la main pour les saisir." }
  if (-not $cid -or -not $csec) {
    Write-Host "Première utilisation : colle tes identifiants Blizzard (ils seront mémorisés, chiffrés pour ton compte Windows)."
    $cid = (Read-Host 'Client ID').Trim()
    $sec = Read-Host 'Client Secret' -AsSecureString
    $csec = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()
    Save-Secret $ApiIdPath (ConvertTo-SecureString $cid -AsPlainText -Force); Save-Secret $ApiSecPath (ConvertTo-SecureString $csec -AsPlainText -Force)
  }
  try {
    $tok = Invoke-RestMethod -Method Post -Uri 'https://oauth.battle.net/token' -Body @{grant_type='client_credentials'} `
      -Headers @{Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${cid}:$csec"))}
  } catch { Remove-Item $ApiIdPath, $ApiSecPath -Force -ErrorAction SilentlyContinue; throw "Identifiants Blizzard refusés (effacés) : relance pour les ressaisir. $($_.Exception.Message)" }
  $csec = $null

  $body = $null
  try { $body = (Invoke-WebRequest -UseBasicParsing -Uri "https://eu.api.blizzard.com/data/wow/ruleset/1/auctions/${ah}/commodities?namespace=dynamic-forever-eu&locale=fr_FR" -Headers @{Authorization = "Bearer $($tok.access_token)"}).Content } catch {}
  if (-not $body) { throw "HV $ah illisible via l'API Blizzard." }
  $min = @{}
  foreach ($m in [regex]::Matches($body, '"item":\{"id":(\d+)\},"quantity":\d+,"unit_price":(\d+)')) {
    $k = [int]$m.Groups[1].Value; $v = [int64]$m.Groups[2].Value
    if (-not $min.ContainsKey($k) -or $v -lt $min[$k]) { $min[$k] = $v }
  }

  # Objets sans identifiant (lignes U; de l'export) : recherche par nom dans la base d'objets Blizzard (namespace static).
  # Les identifiants trouvés sont mémorisés dans ids.json ; les introuvables ne sont retentés qu'après 3 jours.
  $rlog = New-Object System.Collections.Generic.List[string]
  try {
    $unres = New-Object System.Collections.Generic.List[string]
    if ($text) { foreach ($ln in ($text -split "`n")) { $f = $ln.TrimEnd("`r").Split(";"); if ($f[0] -eq "U" -and $f.Count -ge 2 -and $f[1] -and -not $ids.ContainsKey($f[1])) { $unres.Add($f[1]) } } }
    $miss = @{}; if (Test-Path $MissPath) { try { (Get-Content $MissPath -Raw -Encoding UTF8 | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $miss[$_.Name] = [int64]$_.Value } } catch {} }
    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $todo = @($unres | Where-Object { -not $miss.ContainsKey($_) -or ($now - $miss[$_]) -gt 259200 } | Sort-Object -Unique)
    $rlog.Add(("Objets sans identifiant : {0} ; à rechercher : {1}" -f $unres.Count, $todo.Count))
    if ($todo.Count -gt 0) {
      Write-Host ("Recherche des identifiants de {0} objets (première fois seulement)..." -f $todo.Count)
      $found = 0; $errs = 0; $okq = 0; $first = ""; $mlog = New-Object System.Collections.Generic.List[string]
      $hdr = @{Authorization = "Bearer $($tok.access_token)"}
      foreach ($nm in $todo) {
        $uri = "https://eu.api.blizzard.com/data/wow/search/item?namespace=static-forever-eu&locale=fr_FR&orderby=id&_pageSize=1000&name.fr_FR=" + [Uri]::EscapeDataString($nm)
        try {
          $r = Invoke-WebRequest -UseBasicParsing -Uri $uri -Headers $hdr
          $okq++
          $js = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
          $nn = $nm.Replace([string][char]0x2019, "'")
          $cands = @($js.results | Where-Object { ([string]$_.data.name.fr_FR).Replace([string][char]0x2019, "'") -eq $nn } | ForEach-Object { [int]$_.data.id })
          if ($cands.Count -gt 0) {
            $inAh = @($cands | Where-Object { $min.ContainsKey($_) })
            $ids[$nm] = if ($inAh.Count -gt 0) { ($inAh | Sort-Object | Select-Object -First 1) } else { ($cands | Sort-Object | Select-Object -First 1) }
            $found++
          } else { $miss[$nm] = $now; if ($mlog.Count -lt 12) { $mlog.Add(("  introuvable : {0} -> {1} résultat(s) : {2}" -f $nm, @($js.results).Count, ((@($js.results) | Select-Object -First 3 | ForEach-Object { $_.data.name.fr_FR }) -join " | "))) } }
        } catch {
          $errs++; if (-not $first) { $first = $_.Exception.Message }
          if ($errs -ge 3 -and $okq -eq 0) { $rlog.Add("Recherche indisponible, abandon : $first"); break }
        }
      }
      $rlog.Add(("Recherche : {0} identifiants trouvés, {1} requêtes réussies, {2} erreurs. {3}" -f $found, $okq, $errs, $first))
      foreach ($ml in $mlog) { $rlog.Add($ml) }
      $o2 = [ordered]@{}; foreach ($k in ($ids.Keys | Sort-Object)) { $o2[$k] = $ids[$k] }
      $o2 | ConvertTo-Json | Set-Content -Path $IdsPath -Encoding UTF8
      $m2 = [ordered]@{}; foreach ($k in ($miss.Keys | Sort-Object)) { $m2[$k] = $miss[$k] }
      $m2 | ConvertTo-Json | Set-Content -Path $MissPath -Encoding UTF8
      Write-Host ($rlog -join "`n")
    }
  } catch { $rlog.Add("Recherche d'identifiants en échec : " + $_.Exception.Message) }
  Set-Content -Path $ItemsLogPath -Value ($rlog -join "`n") -Encoding UTF8
  $t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $day = [DateTimeOffset]::FromUnixTimeSeconds($t).LocalDateTime.ToString("yyyy-MM-dd")
  $pl = New-Object System.Collections.Generic.List[string]
  foreach ($name in ($ids.Keys | Sort-Object)) { $k = $ids[$name]; if ($min.ContainsKey($k)) { $pl.Add(("P;{0};{1};;{2}" -f $name, $min[$k], $k)) } }
  if ($pl.Count -eq 0) { throw "Aucun de tes objets n'a d'annonce dans l'HV $ah." }
  $apiText = ("WFA1;{0};{1};{2}" -f $t, $ah, $pl.Count) + "`n" + ($pl -join "`n")
  Set-Content -Path $ApiLastPath -Value ("$day`n" + $apiText) -Encoding UTF8

  $keys = Get-Keys $pass ([Convert]::FromBase64String($cfg.salt))
  Gh-Put $cfg $token "data/api.json" (Protect-Bytes ([Text.Encoding]::UTF8.GetBytes($apiText)) $keys) ("prix API {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm"))
  # Jour courant : fichier de prix = export local + prix API par-dessus (historique pour les autres appareils)
  $priceLines = @{}
  # Les prix de l'export ne servent qu'à compléter le jour de cet export : un export ancien ne doit pas créer de faux points
  $expDay = ""; if ($text -and (($text -split "`n")[0]) -match "^WFC1;(\d+);") { $expDay = [DateTimeOffset]::FromUnixTimeSeconds([int64]$Matches[1]).LocalDateTime.ToString("yyyy-MM-dd") }
  if ($text -and $expDay -eq $day) { foreach ($ln in ($text -split "`n")) { $ln = $ln.TrimEnd("`r"); if ($ln -match "^P;([^;]*);") { $priceLines[$Matches[1]] = $ln } } }
  foreach ($l in $pl) { $f = $l.Split(";"); $priceLines[$f[1]] = $l }
  $pj = Protect-Bytes ([Text.Encoding]::UTF8.GetBytes((@("WFC1;$t;API;$ah") + ($priceLines.Values | Sort-Object)) -join "`n")) $keys
  Gh-Put $cfg $token ("data/p-{0}.json" -f $day) $pj ("prix {0}" -f $day)
  $days = @(); $idx = Gh-GetText $cfg $token "data/index.json"
  if ($idx) { try { $days = @(($idx | ConvertFrom-Json).days) } catch {} }
  if ($days -notcontains $day) {
    $days = @($days + $day | Sort-Object -Unique)
    Gh-Put $cfg $token "data/index.json" ('{{"t":{0},"days":[{1}]}}' -f $t, (($days | ForEach-Object { '"' + $_ + '"' }) -join ",")) "index"
  }
  Log ("Prix API envoyés : {0} prix (HV {1}) sur {2} objets connus." -f $pl.Count, $ah, $ids.Count)
  $rl = @($rlog | Where-Object { $_ -like "Recherche*" } | Select-Object -Last 1); if ($rl.Count -gt 0 -and $rl[0]) { Log $rl[0] }
}

# ---------- Tâche planifiée : relevé quotidien des prix de l'HV ----------
function Run-Schedule {
  $ps1 = $PSCommandPath; if (-not $ps1) { $ps1 = $MyInvocation.MyCommand.Path }
  if (-not (Test-Path $CfgPath) -or -not (Test-Path $ApiIdPath)) { throw "Lance d'abord Prix-API.bat une fois à la main (saisie des identifiants Blizzard), puis relance Planifier-HV.bat." }
  $arg = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -Prices -Auto' -f $ps1
  $act = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg
  $trg = New-ScheduledTaskTrigger -Daily -At "19:30"
  $set = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
  [void](Register-ScheduledTask -TaskName "Gringotts - Prix HV" -Action $act -Trigger $trg -Settings $set -Description "Relevé quotidien des prix de l'HV (API Blizzard) pour le dashboard Gringotts" -Force)
  Write-Host "Tâche « Gringotts - Prix HV » créée : tous les jours à 19h30 (rattrapage au réveil du PC si l'heure est manquée)."
  Write-Host "Script utilisé : $ps1 (relance Planifier-HV.bat si tu déplaces ce dossier)."
  Write-Host "Résultat de chaque exécution : $LogPath"
}
function Run-Unschedule {
  Unregister-ScheduledTask -TaskName "Gringotts - Prix HV" -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Tâche « Gringotts - Prix HV » supprimée."
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
if ($Compare) { Run-Compare; return }
if ($Schedule) { Run-Schedule; return }
if ($Unschedule) { Run-Unschedule; return }
if ($Prices -and $Auto) { try { Run-Prices } catch { Log ("Erreur prix automatiques : " + $_.Exception.Message); exit 1 }; return }
if ($Prices) { Run-Prices; return }
if ($Watch) { Run-Watch; return }
if ($Once -or $OutDir -or (-not $Watch)) {
  $cfg = if (Test-Path $CfgPath) { Get-Content $CfgPath -Raw | ConvertFrom-Json } else { [pscustomobject]@{ sv = $File; repo = "Zazahkel-Gringotts/Gringotts"; branch = "main"; salt = "" } }
  $token = Read-Secret $TokPath; $pass = Read-Secret $PwdPath
  if ($env:GT_PASS) { $pass = $env:GT_PASS }
  if (-not $pass) { throw "Mot de passe absent : lance Installer.bat (ou définis GT_PASS pour un test)." }
  [void](Sync-Once $cfg $token $pass)
  return
}
