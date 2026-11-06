# Test manuel de l'API Blizzard pour WoW Forever (namespace dynamic-forever) : lecture seule.
# Ne stocke ni l'identifiant ni le secret. Rapport : %APPDATA%\GringottsSync\api-test.txt
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Region = 'eu'; $Ns = "dynamic-forever-$Region"
$dir = Join-Path $env:APPDATA 'GringottsSync'; New-Item -ItemType Directory -Force -Path $dir | Out-Null
$out = Join-Path $dir 'api-test.txt'; Set-Content -Path $out -Value ("Test API Forever " + (Get-Date -Format s)) -Encoding UTF8
function Log($t) { Write-Host $t; Add-Content -Path $out -Value $t -Encoding UTF8 }

$id = (Read-Host 'Client ID').Trim()
$sec = Read-Host 'Client Secret' -AsSecureString
$secPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()

try {
  $tok = Invoke-RestMethod -Method Post -Uri 'https://oauth.battle.net/token' -Body @{grant_type='client_credentials'} `
    -Headers @{Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${id}:$secPlain"))}
} catch { Log "Jeton refusé : $($_.Exception.Message)"; exit 1 }
$secPlain = $null
Log 'Jeton obtenu.'

function Get-Api($path) {
  $url = "https://$Region.api.blizzard.com$path" + $(if ($path.Contains('?')) {'&'} else {'?'}) + "namespace=$Ns&locale=fr_FR"
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{Authorization = "Bearer $($tok.access_token)"}
    return @{ code = [int]$r.StatusCode; body = $r.Content }
  } catch {
    $c = 0; if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode }
    return @{ code = $c; body = '' }
  }
}
function Show($label, $r) {
  $len = ($r.body | Measure-Object -Character).Characters
  Log ("{0,-48} -> HTTP {1}  ({2} car.)" -f $label, $r.code, $len)
}

$r = Get-Api '/data/wow/realm/index'; Show 'realm/index' $r
$r = Get-Api '/data/wow/ruleset/index'; Show 'ruleset/index' $r
if ($r.code -eq 200) { Log ('  ' + $r.body.Substring(0, [Math]::Min(700, $r.body.Length))) }
$rulesetIds = @(); if ($r.code -eq 200) { $rulesetIds = [regex]::Matches($r.body, '/ruleset/(\d+)') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique }

foreach ($rs in $rulesetIds) {
  $ix = Get-Api "/data/wow/ruleset/$rs/auctions/index"; Show "ruleset/$rs/auctions/index" $ix
  if ($ix.code -ne 200) { continue }
  Log ('  ' + $ix.body.Substring(0, [Math]::Min(900, $ix.body.Length)))
  $ahs = [regex]::Matches($ix.body, '/auctions/(\d+)') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
  foreach ($ah in $ahs) {
    $a = Get-Api "/data/wow/ruleset/$rs/auctions/$ah"; Show "ruleset/$rs/auctions/$ah" $a
    if ($a.code -eq 200) { Log ("  annonces (balises id) : " + ([regex]::Matches($a.body, '"id"')).Count) }
    $c = Get-Api "/data/wow/ruleset/$rs/auctions/$ah/commodities"; Show "ruleset/$rs/auctions/$ah/commodities" $c
    if ($c.code -eq 200) {
      Log ("  lignes unit_price : " + ([regex]::Matches($c.body, '"unit_price"')).Count)
      Log ('  début : ' + $c.body.Substring(0, [Math]::Min(500, $c.body.Length)))
    }
  }
}
Log ''
Log "Rapport enregistré : $out"
