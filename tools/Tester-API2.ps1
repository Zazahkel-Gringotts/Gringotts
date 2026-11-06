# Identifie ton HV Forever : liste les HV et compare le prix minimum de quelques objets. Lecture seule.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Region = 'eu'; $Ns = "dynamic-forever-$Region"
$dir = Join-Path $env:APPDATA 'GringottsSync'; New-Item -ItemType Directory -Force -Path $dir | Out-Null
$out = Join-Path $dir 'api-test2.txt'; Set-Content -Path $out -Value ("Test API Forever 2 " + (Get-Date -Format s)) -Encoding UTF8
function Log($t) { Write-Host $t; Add-Content -Path $out -Value $t -Encoding UTF8 }

$id = (Read-Host 'Client ID').Trim()
$sec = Read-Host 'Client Secret' -AsSecureString
$secPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()
$tok = Invoke-RestMethod -Method Post -Uri 'https://oauth.battle.net/token' -Body @{grant_type='client_credentials'} `
  -Headers @{Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${id}:$secPlain"))}
$secPlain = $null
function Get-Api($path) {
  $url = "https://${Region}.api.blizzard.com${path}?namespace=${Ns}&locale=fr_FR"
  try { return (Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{Authorization = "Bearer $($tok.access_token)"}).Content } catch { return $null }
}
$items = [ordered]@{ 2840='Barre de cuivre'; 2589='Toile de lin'; 2592='Toile de laine'; 4306='Toile de soie'; 2770='Minerai de cuivre'; 2771='Minerai d etain'; 2447='Pacifique'; 765='Feuillargent'; 2318='Cuir leger'; 2835='Pierre brute' }

$ix = Get-Api '/data/wow/ruleset/1/auctions/index'
if (-not $ix) { Log 'Index HV illisible.'; exit 1 }
$ahs = [regex]::Matches($ix, '"name":"([^"]*)","id":(\d+)') | ForEach-Object { [pscustomobject]@{ id = $_.Groups[2].Value; name = $_.Groups[1].Value } }
Log "HV listees : $($ahs.Count)"
Log ('Objets : ' + (($items.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ' | '))
Log ''
Log ('{0,-5} {1,-34} {2,8} {3}' -f 'HV', 'Nom', 'Lignes', 'Prix min (cuivre) : ' + (($items.Keys) -join ' / '))
foreach ($ah in $ahs) {
  $body = Get-Api "/data/wow/ruleset/1/auctions/$($ah.id)/commodities"
  if (-not $body) { Log ('{0,-5} {1,-34} illisible' -f $ah.id, $ah.name); continue }
  $min = @{}; $n = 0
  foreach ($m in [regex]::Matches($body, '"item":\{"id":(\d+)\},"quantity":\d+,"unit_price":(\d+)')) {
    $n++; $k = [int]$m.Groups[1].Value
    if ($items.Contains($k)) { $p = [long]$m.Groups[2].Value; if (-not $min.ContainsKey($k) -or $p -lt $min[$k]) { $min[$k] = $p } }
  }
  $cols = ($items.Keys | ForEach-Object { if ($min.ContainsKey($_)) { $min[$_] } else { '-' } }) -join ' / '
  Log ('{0,-5} {1,-34} {2,8} {3}' -f $ah.id, $ah.name, $n, $cols)
}
Log ''
Log "Rapport enregistre : $out"
