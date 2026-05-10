// ============================================================
// TITLE SCREEN
// ============================================================

function showTitleScreen(STATE) {
  const el = document.getElementById('screenTitle');
  el.style.display = 'flex';

  const save = loadProgress();
  const bestWave  = save?.highWave  ?? 0;
  const bestScore = save?.highScore ?? 0;

  el.innerHTML = `
    <h1>APOCOLLAPSE</h1>
    <p>The world is ending.<br>Then it ends again. And again.</p>
    ${bestWave > 0 ? `<p style="font-size:11px;color:#555">Best: Wave ${bestWave} &nbsp;|&nbsp; ${bestScore.toLocaleString()} pts</p>` : ''}
    <p style="font-size:11px;color:#444;line-height:2.1">
      WASD move &nbsp;|&nbsp; Mouse aim &nbsp;|&nbsp; 1-4 / scroll select ability<br>
      SPACE use ability &nbsp;|&nbsp; Squad fires automatically
    </p>
    <button id="titleStartBtn">Begin the End</button>
    ${bestWave > 0 ? '<button class="secondary" id="titleResetBtn" style="margin-top:4px">Reset Progress</button>' : ''}
  `;

  document.getElementById('titleStartBtn').addEventListener('click', () => {
    hideTitleScreen();
    startGame(STATE);
  });

  const resetBtn = document.getElementById('titleResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all progress?')) {
        resetProgress();
        showTitleScreen(STATE);
      }
    });
  }
}

function hideTitleScreen() {
  document.getElementById('screenTitle').style.display = 'none';
}
