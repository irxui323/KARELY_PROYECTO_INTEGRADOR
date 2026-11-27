param(
  [string]$Servicio = 'orcl',
  [ValidateRange(1,65535)][int]$Puerto = 1521,
  [string]$HostOracle = 'localhost',
  [switch]$InicializarAdmin,
  [switch]$CorreoGmail
)
$ErrorActionPreference = 'Stop'
$variablesCorreo = @('APP_RECOVERY_ENABLED','APP_RECOVERY_FROM','MAIL_HOST','MAIL_PORT','MAIL_USERNAME','MAIL_PASSWORD')
$correoAnterior = @{}
if ($CorreoGmail) {
  foreach ($nombreCorreo in $variablesCorreo) {
    $correoAnterior[$nombreCorreo] = [Environment]::GetEnvironmentVariable($nombreCorreo, 'Process')
  }
}
Push-Location $PSScriptRoot
try {
  Write-Host 'KARELY - compilacion del backend antes de pedir credenciales...' -ForegroundColor Cyan
  & .\mvnw.cmd -DskipTests compile
  if ($LASTEXITCODE -ne 0) { throw 'Fallo la compilacion de Maven. No se solicito ninguna contrasena.' }

  $env:DB_URL = "jdbc:oracle:thin:@//$HostOracle`:$Puerto/$Servicio"
  $env:DB_USERNAME = 'KARELY_BD2'
  $dbSecure = Read-Host 'Contrasena Oracle de KARELY_BD2' -AsSecureString
  $env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $dbSecure).Password
  $dbSecure = $null
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $env:APP_JWT_SECRET = [Convert]::ToBase64String($bytes)
  [Array]::Clear($bytes, 0, $bytes.Length)
  $env:APP_FRONTEND_ORIGIN = 'http://localhost:4200'

  if ($CorreoGmail) {
    $remitenteCorreo = (Read-Host 'Cuenta Gmail remitente de Karely').Trim().ToLowerInvariant()
    if ($remitenteCorreo -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw 'Introduce un correo remitente valido.' }
    $claveCorreoSegura = Read-Host 'Contrasena de aplicacion de Google (16 caracteres, no la clave normal)' -AsSecureString
    $claveCorreoTexto = ([System.Net.NetworkCredential]::new('', $claveCorreoSegura).Password) -replace '\s',''
    $claveCorreoSegura = $null
    if ($claveCorreoTexto.Length -ne 16) { $claveCorreoTexto = $null; throw 'Google requiere su contrasena de aplicacion de 16 caracteres.' }
    $env:APP_RECOVERY_ENABLED = 'true'
    $env:APP_RECOVERY_FROM = $remitenteCorreo
    $env:MAIL_HOST = 'smtp.gmail.com'
    $env:MAIL_PORT = '587'
    $env:MAIL_USERNAME = $remitenteCorreo
    $env:MAIL_PASSWORD = $claveCorreoTexto
    $claveCorreoTexto = $null
    $remitenteCorreo = $null
  }
  if ($env:APP_RECOVERY_ENABLED -eq 'true') {
    if ([string]::IsNullOrWhiteSpace($env:MAIL_HOST) -or [string]::IsNullOrWhiteSpace($env:MAIL_USERNAME) -or [string]::IsNullOrWhiteSpace($env:MAIL_PASSWORD) -or ([string]::IsNullOrWhiteSpace($env:APP_RECOVERY_FROM) -and [string]::IsNullOrWhiteSpace($env:APP_MAIL_FROM))) {
      throw 'Recuperacion activada sin remitente SMTP completo. Usa -CorreoGmail o configura las variables de correo.'
    }
    Write-Host 'Recuperacion por correo: activada. La entrega requiere autorizacion valida del proveedor SMTP.' -ForegroundColor Cyan
  } else {
    Write-Host 'Recuperacion por correo: desactivada. Para configurar Gmail inicia con -CorreoGmail.' -ForegroundColor Yellow
  }

  if ($InicializarAdmin) {
    $env:APP_BOOTSTRAP_USERNAME = Read-Host 'Usuario inicial (ej. administradora)'
    $env:APP_BOOTSTRAP_EMAIL = Read-Host 'Correo del usuario inicial'
    $adminSecure = Read-Host 'Nueva contrasena de la pagina (12+ caracteres)' -AsSecureString
    $env:APP_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecure).Password
    $adminSecure = $null
  }

  Write-Host 'Iniciando Spring Boot... Mantenga abierta esta terminal.' -ForegroundColor Cyan
  & .\mvnw.cmd spring-boot:run
  if ($LASTEXITCODE -ne 0) { throw 'Spring Boot no inicio. Consulte el error Maven/Oracle anterior.' }
}
finally {
  $claveCorreoSegura = $null
  $claveCorreoTexto = $null
  if ($CorreoGmail) {
    foreach ($nombreCorreo in $variablesCorreo) {
      [Environment]::SetEnvironmentVariable($nombreCorreo, $correoAnterior[$nombreCorreo], 'Process')
    }
  }
  Pop-Location
  foreach ($variable in @('DB_PASSWORD','APP_JWT_SECRET','APP_BOOTSTRAP_PASSWORD',
                          'APP_BOOTSTRAP_EMAIL','APP_BOOTSTRAP_USERNAME')) {
    Remove-Item "Env:$variable" -ErrorAction SilentlyContinue
  }
}
