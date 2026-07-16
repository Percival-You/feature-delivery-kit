param(
    [string]$TargetRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptDir
$KitCursor = Join-Path $KitRoot "cursor"

$CursorDir = Join-Path $TargetRoot ".cursor"
$HooksDir = Join-Path $CursorDir "hooks"
$SkillsDir = Join-Path $CursorDir "skills"
$AgentsDir = Join-Path $CursorDir "agents"

Write-Host "FDP Install -> $CursorDir"

@($CursorDir, $HooksDir, $SkillsDir, $AgentsDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# Skills
$srcSkills = Join-Path $KitCursor "skills"
Get-ChildItem $srcSkills -Directory | ForEach-Object {
    $dest = Join-Path $SkillsDir $_.Name
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $_.FullName $dest -Recurse -Force
    Write-Host "  skill: $($_.Name)"
}

# Agents
$srcAgents = Join-Path $KitCursor "agents"
if (Test-Path $srcAgents) {
    Get-ChildItem $srcAgents -Filter "*.md" | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $AgentsDir $_.Name) -Force
        Write-Host "  agent: $($_.Name)"
    }
}

# Hooks
$srcHooks = Join-Path $KitCursor "hooks"
Get-ChildItem $srcHooks -Filter "*.mjs" | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $HooksDir $_.Name) -Force
    Write-Host "  hook: $($_.Name)"
}

# fdp.config
$exampleConfig = Join-Path $KitCursor "fdp.config.example.json"
$destConfig = Join-Path $CursorDir "fdp.config.json"
$destExample = Join-Path $CursorDir "fdp.config.example.json"
Copy-Item $exampleConfig $destExample -Force
if (-not (Test-Path $destConfig)) {
    Copy-Item $exampleConfig $destConfig -Force
    Write-Host "  created fdp.config.json (please edit)"
} else {
    Write-Host "  kept existing fdp.config.json"
}

# hooks.json merge
$srcHooksJson = Join-Path $KitCursor "hooks.json"
$destHooksJson = Join-Path $CursorDir "hooks.json"
$fdpHooks = Get-Content $srcHooksJson -Raw | ConvertFrom-Json

if (Test-Path $destHooksJson) {
    $existing = Get-Content $destHooksJson -Raw | ConvertFrom-Json
    if (-not $existing.hooks) { $existing | Add-Member -NotePropertyName hooks -NotePropertyValue @{} }
    foreach ($event in @("preToolUse", "stop")) {
        $fdpEntries = $fdpHooks.hooks.$event
        if ($null -eq $fdpEntries) { continue }
        if ($null -eq $existing.hooks.$event) {
            $existing.hooks | Add-Member -NotePropertyName $event -NotePropertyValue @()
        }
        $existingList = [System.Collections.ArrayList]@($existing.hooks.$event)
        foreach ($entry in $fdpEntries) {
            $cmd = $entry.command
            $dup = $existingList | Where-Object { $_.command -eq $cmd }
            if (-not $dup) {
                [void]$existingList.Add($entry)
                Write-Host "  merged hook event: $event -> $cmd"
            }
        }
        $existing.hooks.$event = $existingList.ToArray()
    }
    $existing | ConvertTo-Json -Depth 10 | Set-Content $destHooksJson -Encoding UTF8
} else {
    Copy-Item $srcHooksJson $destHooksJson -Force
    Write-Host "  installed hooks.json"
}

# Optional rule
$srcRule = Join-Path $KitCursor "rules\fdp-routing.mdc"
$destRules = Join-Path $CursorDir "rules"
if (Test-Path $srcRule) {
    if (-not (Test-Path $destRules)) { New-Item -ItemType Directory -Path $destRules -Force | Out-Null }
    Copy-Item $srcRule (Join-Path $destRules "fdp-routing.mdc") -Force
    Write-Host "  rule: fdp-routing.mdc"
}

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  1. Edit .cursor/fdp.config.json (docsRoot, activeFeature, testCommand)"
Write-Host "  2. Restart Cursor"
Write-Host "  3. Say: 按 FDP 全流程 feature {name}"
