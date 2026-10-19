(() => {
  const homeUrl = () => new URL('../inicio.html', window.location.href).href;

  const logout = () => {
    localStorage.removeItem('espacioschile_user');
    window.location.assign(homeUrl());
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const logoutButton = event.target.closest('[data-session-logout]');
    const sidebarLink = event.target.closest('aside a, [role="complementary"] a');
    const isSidebarLogout = sidebarLink
      && sidebarLink.textContent.trim().replace(/\s+/g, ' ') === 'Cerrar Sesión';

    if (!logoutButton && !isSidebarLogout) return;

    event.preventDefault();
    logout();
  });

  const storedSession = localStorage.getItem('espacioschile_user');
  if (!storedSession) return;

  let session;
  try {
    session = JSON.parse(storedSession);
  } catch (error) {
    console.error('No se pudo leer la sesión de EspaciosChile.', error);
    return;
  }

  if (!session || !session.isLoggedIn) return;

  const topBar = document.querySelector('header') || document.querySelector('body > nav');
  if (!topBar) return;

  const links = Array.from(topBar.querySelectorAll('a'));
  const accountLink = links.find((link) => link.textContent.trim().toLowerCase() === 'mi cuenta');
  const loginLink = links.find((link) => (link.getAttribute('href') || '').includes('login.html'));
  const accountAvatarLink = links.find((link) => {
    const image = link.querySelector('img');
    return image && (/perfil|avatar/i.test(image.alt)
      || /rounded-full/.test(`${link.className} ${image.className}`)
      || (link.getAttribute('href') || '').includes('login.html'));
  });
  const avatarLink = accountAvatarLink || (!accountLink ? loginLink : null);

  if (topBar.querySelector('[data-session-account]')) return;

  const role = (session.rol || '').toLowerCase();
  let panelUrl = '../propietario/dashboardpropietario.html';
  if (role === 'admin') panelUrl = '../admin/moderaciondeespacios.html';
  if (role === 'cliente') panelUrl = '../explorer/buscadorespacios.html';

  const previousImage = avatarLink && avatarLink.querySelector('img');
  const profileImageUrl = session.fotoPerfil
    || session.foto
    || session.avatar
    || session.profilePicture
    || session.photo
    || (previousImage && previousImage.getAttribute('src'))
    || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const displayName = session.nombre || session.name || session.email || 'Mi Cuenta';

  const accountContainer = document.createElement('div');
  accountContainer.className = 'flex items-center gap-sm ml-sm';
  accountContainer.dataset.sessionAccount = 'true';

  const profileLink = document.createElement('a');
  profileLink.href = panelUrl;
  profileLink.className = 'flex items-center gap-xs group text-on-surface hover:text-primary transition-colors';
  profileLink.title = 'Ir al Panel';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'w-10 h-10 rounded-full overflow-hidden border-2 border-primary';

  const profileImage = document.createElement('img');
  profileImage.src = profileImageUrl;
  profileImage.alt = 'Foto de perfil del usuario';
  profileImage.className = 'w-full h-full object-cover';
  imageContainer.appendChild(profileImage);

  const name = document.createElement('span');
  name.className = 'font-body-md text-sm font-semibold hidden md:inline-block';
  name.textContent = displayName;

  profileLink.append(imageContainer, name);

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.dataset.sessionLogout = 'true';
  logoutButton.title = 'Cerrar Sesión';
  logoutButton.setAttribute('aria-label', 'Cerrar Sesión');
  logoutButton.className = 'text-outline hover:text-error transition-colors p-1.5 flex items-center justify-center rounded-lg hover:bg-error-container/20 cursor-pointer';
  logoutButton.innerHTML = '<span class="material-symbols-outlined">logout</span>';

  accountContainer.append(profileLink, logoutButton);

  if (avatarLink) {
    avatarLink.replaceWith(accountContainer);
    if (accountLink) {
      accountLink.textContent = 'Mi Panel';
      accountLink.href = panelUrl;
    }
  } else if (accountLink) {
    accountLink.replaceWith(accountContainer);
  }
})();
