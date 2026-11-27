param([Parameter(Mandatory=$true)][string]$Entrada,[Parameter(Mandatory=$true)][string]$Salida)
$ErrorActionPreference='Stop'
$word=$null
$documento=$null
try {
 $word=New-Object -ComObject Word.Application
 $word.Visible=$false
 $word.DisplayAlerts=0
 $word.AutomationSecurity=3
 $documento=$word.Documents.Open($Entrada,$false,$true)
 $documento.Repaginate()
 $documento.ExportAsFixedFormat($Salida,17)
 Write-Output ('Paginas: '+$documento.ComputeStatistics(2))
} finally {
 if($null -ne $documento){$documento.Close(0);[void][Runtime.InteropServices.Marshal]::ReleaseComObject($documento)}
 if($null -ne $word){$word.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)}
}
