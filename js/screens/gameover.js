// ============================================================
// GAME OVER SCREEN
// ============================================================

function showGameOverScreen(STATE) {
  saveProgress(STATE);
  const el = document.getElementById('screenDead');
  el.style.display = 'flex';

  el.innerHTML = `
    <h2 style="color:#ff4422">YOU COLLAPSED</h2>
    <p>
      Wave ${STATE.wave} &nbsp;|&nbsp; ${STATE.score.toLocaleString()} pts &nbsp;|&nbsp; ${STATE.kills} kills
    </p>
    <p style="font-size:11px;color:#444">
      Active when you fell:<br>
      ${STATE.activeApocs.map(k => getApoc(k).name).join(' + ')}
    </p>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button id="deadRetryBtn">Try Again</button>
      <button class="secondary" id="deadTitleBtn">Title</button>
    </div>
  `;

  document.getElementById('deadRetryBtn').addEventListener('click', () => {
    hideGameOverScreen();
    startGame(window._gameState);
  });
  document.getElementById('deadTitleBtn').addEventListener('click', () => {
    hideGameOverScreen();
    showTitleScreen(window._gameState);
  });
}

function hideGameOverScreen() {
  document.getElementById('screenDead').style.display = 'none';
}
