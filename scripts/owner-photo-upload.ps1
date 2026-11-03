# Run with PowerShell 7 on the owner's Windows account. Never prints the editor key.
[CmdletBinding()]
param(
 [Parameter(Mandatory)][string]$File,
 [Parameter(Mandatory)][string]$TargetId,
 [Parameter(Mandatory)][string]$Alt,
 [Parameter(Mandatory)][string]$Credit,
 [string]$Caption = '', [string]$SourceUrl = '',
 [ValidateSet('owned','permission','licensed')][string]$Rights = 'owned',
 [switch]$ConfirmRights, [switch]$ConfirmPublic,
 [string]$UploadId = '',
 [string]$KeyFile = '',
 [string]$Site = 'https://lightning-mcgreen-living.netlify.app'
)
$ErrorActionPreference = 'Stop'
if (-not $ConfirmRights -or -not $ConfirmPublic) { throw 'Confirm rights and public publication using -ConfirmRights -ConfirmPublic.' }
$siteUri = [Uri]$Site
if ($siteUri.Scheme -ne 'https' -or $siteUri.Port -ne 443 -or $siteUri.UserInfo -or $siteUri.Query -or $siteUri.Fragment -or $siteUri.AbsolutePath -ne '/' -or $siteUri.Host -notmatch '^(lightning-mcgreen-living|deploy-preview-[0-9]+--lightning-mcgreen-living)\.netlify\.app$') { throw 'Only this production site and its numbered previews are permitted.' }
$Site = $siteUri.GetLeftPart([UriPartial]::Authority)
$sourceFile = Get-Item -LiteralPath $File
if ($sourceFile.PSIsContainer -or $sourceFile.Length -gt 4MB) { throw 'Choose a JPEG, PNG or WebP file under 4 MB.' }
$mime = switch ($sourceFile.Extension.ToLowerInvariant()) { '.jpg' {'image/jpeg'} '.jpeg' {'image/jpeg'} '.png' {'image/png'} '.webp' {'image/webp'} default {throw 'Choose a JPEG, PNG or WebP file.'} }
if (-not $UploadId) { $UploadId = [guid]::NewGuid().ToString() }
if ($UploadId -notmatch '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$') { throw 'UploadId must be a version-4 UUID.' }
# Preserve this operation ID when retrying an uncertain result.
Write-Output ('Upload operation: ' + $UploadId)
if (-not $KeyFile) {
 $keyCandidates = @(
  (Join-Path $env:LOCALAPPDATA 'LightningMcGreenLiving\owner-photo-key.xml'),
  (Join-Path ([Environment]::GetFolderPath('UserProfile')) 'AppData\Local\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\LightningMcGreenLiving\owner-photo-key.xml')
 )
 $KeyFile = $keyCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
if (-not $KeyFile) { throw 'The encrypted owner key was not found for this Windows account. See docs/OWNER_PHOTO_ACCESS.md.' }
$secureKey = Import-Clixml -LiteralPath $KeyFile
$credential = [pscredential]::new('owner', $secureKey)
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(40)
$multipart = [System.Net.Http.MultipartFormDataContent]::new()
try {
 $client.DefaultRequestHeaders.Add('x-admin-secret', $credential.GetNetworkCredential().Password)
 $client.DefaultRequestHeaders.Add('Origin', $Site)
 foreach ($pair in @{uploadId=$UploadId;placeId=$TargetId;alt=$Alt;caption=$Caption;credit=$Credit;sourceUrl=$SourceUrl;rights=$Rights;consent='yes'}.GetEnumerator()) { $part = [System.Net.Http.StringContent]::new([string]$pair.Value); $multipart.Add($part, $pair.Key); $part.Headers.ContentDisposition.Name = '"' + $pair.Key + '"' }
 $binary = [System.Net.Http.ByteArrayContent]::new([IO.File]::ReadAllBytes($sourceFile.FullName))
 $binary.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new($mime)
 $multipart.Add($binary, 'photo', $sourceFile.Name)
 $binary.Headers.ContentDisposition.Name = '"photo"'
 $binary.Headers.ContentDisposition.FileName = '"photo' + $sourceFile.Extension.ToLowerInvariant() + '"'
 $binary.Headers.ContentDisposition.FileNameStar = $null
 # Buffer the form to send a deterministic Content-Length through serverless proxies.
 $payload = [System.Net.Http.ByteArrayContent]::new($multipart.ReadAsByteArrayAsync().GetAwaiter().GetResult())
 $payload.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($multipart.Headers.ContentType.ToString().Replace('"', ''))
 try { $response = $client.PostAsync($Site + '/api/place-photos/upload', $payload).GetAwaiter().GetResult() } finally { $payload.Dispose() }
 $text = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
 if (-not $response.IsSuccessStatusCode) { throw ('Upload rejected with HTTP ' + [int]$response.StatusCode + '. ' + $text) }
 $text | ConvertFrom-Json | ConvertTo-Json -Depth 8
} finally { $multipart.Dispose(); $client.Dispose(); $credential = $null; $secureKey = $null }
