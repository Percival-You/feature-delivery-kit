param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [ValidateSet("junction", "submodule")]
    [string]$Mode = "junction"
)

$ErrorActionPreference = "Stop"
$CanonicalRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LinkPath = Join-Path $ProjectRoot "feature-delivery-kit"

if (-not (Test-Path $ProjectRoot)) {
    throw "项目目录不存在: $ProjectRoot"
}

if (Test-Path $LinkPath) {
    $item = Get-Item $LinkPath -Force
    if ($item.LinkType -eq "Junction") {
        $target = (Get-Item $LinkPath).Target
        if ($target -eq $CanonicalRoot) {
            Write-Host "已存在指向 canonical 的联接，跳过: $LinkPath"
            exit 0
        }
        Remove-Item $LinkPath -Force
    } elseif ($item.LinkType -eq "SymbolicLink") {
        Remove-Item $LinkPath -Force
    } else {
        $backup = "$LinkPath.bak.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Write-Host "备份现有目录 -> $backup"
        Rename-Item $LinkPath $backup
    }
}

if ($Mode -eq "junction") {
    New-Item -ItemType Junction -Path $LinkPath -Target $CanonicalRoot | Out-Null
    Write-Host "已创建 Junction:"
    Write-Host "  $LinkPath -> $CanonicalRoot"
} else {
    Push-Location $ProjectRoot
    try {
        if (-not (Test-Path ".git")) {
            throw "submodule 模式需要项目已是 Git 仓库。请用 -Mode junction 或先 git init。"
        }
        git submodule add $CanonicalRoot feature-delivery-kit
        Write-Host "已添加 submodule: feature-delivery-kit"
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "下一步:"
Write-Host "  cd $ProjectRoot"
Write-Host "  .\feature-delivery-kit\scripts\install.ps1"
Write-Host "  重启 Cursor"
