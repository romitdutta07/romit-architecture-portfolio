const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Urban Housing Complex',
    category: 'Residential / 2025',
    image_url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80',
    description: 'A mixed-income housing prototype designed around daylight, social interaction, and climate-sensitive planning.'
  },
  {
    id: 'p2',
    title: 'Cultural Learning Hub',
    category: 'Institutional / 2024',
    image_url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    description: 'A civic space that blends public library, exhibition gallery, and community classrooms into one porous campus.'
  },
  {
    id: 'p3',
    title: 'Coastal Habitat Studio',
    category: 'Adaptive Reuse / 2023',
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'A resilient coastal retreat exploring vernacular rhythms, natural ventilation, and low-impact material use.'
  }
];

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach((section) => observer.observe(section));

function getSupabaseClient() {
  const config = window.SUPABASE_CONFIG;

  if (!config || !config.url || !config.anonKey || config.url.includes('YOUR_PROJECT_ID') || config.anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    return null;
  }

  return window.supabase.createClient(config.url, config.anonKey);
}

function normalizeProject(project) {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    imageUrl: project.image_url || project.imageUrl,
    description: project.description
  };
}

function buildProjectCard(project) {
  return `
    <article class="project-card">
      <img src="${project.imageUrl}" alt="${project.title}" />
      <div class="project-info">
        <span>${project.category}</span>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    </article>
  `;
}

function renderProjectGrid(projects) {
  const projectGrid = document.getElementById('portfolioProjectsGrid');
  if (!projectGrid) return;

  const normalizedProjects = projects.map(normalizeProject);
  projectGrid.innerHTML = normalizedProjects.map(buildProjectCard).join('');
}

function renderAdminProjectList(projects) {
  const projectList = document.getElementById('projectList');
  if (!projectList) return;

  if (!projects.length) {
    projectList.innerHTML = '<p class="empty-state">No projects added yet.</p>';
    return;
  }

  projectList.innerHTML = projects.map((project) => {
    const item = normalizeProject(project);
    return `
      <div class="project-list-item" data-id="${item.id}">
        <div>
          <strong>${item.title}</strong>
          <small>${item.category}</small>
        </div>
        <div class="list-actions">
          <button type="button" class="edit-btn" data-action="edit" data-id="${item.id}">Edit</button>
          <button type="button" class="delete-btn" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

async function fetchProjects() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return DEFAULT_PROJECTS.map(normalizeProject);
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return DEFAULT_PROJECTS.map(normalizeProject);
  }

  return data || [];
}

async function refreshProjects() {
  const projects = await fetchProjects();
  renderProjectGrid(projects);
  renderAdminProjectList(projects);
}

function populateProjectForm(project) {
  const hiddenId = document.getElementById('projectId');
  const titleInput = document.getElementById('projectTitle');
  const categoryInput = document.getElementById('projectCategory');
  const imageInput = document.getElementById('projectImage');
  const descriptionInput = document.getElementById('projectDescription');

  hiddenId.value = project.id;
  titleInput.value = project.title;
  categoryInput.value = project.category;
  imageInput.value = project.image_url || project.imageUrl;
  descriptionInput.value = project.description;
}

function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
}

function toggleAdminVisibility(isLoggedIn, adminToggle) {
  const adminPanel = document.getElementById('adminPanel');
  if (!adminPanel || !adminToggle) return;

  if (isLoggedIn) {
    adminPanel.classList.remove('hidden');
    adminToggle.textContent = 'Admin On';
  } else {
    adminPanel.classList.add('hidden');
    adminToggle.textContent = 'Admin';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Add your Supabase URL and anon key to supabase-config.js before logging in.');
    return;
  }

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
    return;
  }

  if (data?.session) {
    document.getElementById('adminLoginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
    toggleAdminVisibility(true, document.getElementById('adminToggle'));
  }
}

async function handleLogout() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }

  toggleAdminVisibility(false, document.getElementById('adminToggle'));
}

async function handleProjectSave(event) {
  event.preventDefault();

  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Please configure Supabase in supabase-config.js before creating projects.');
    return;
  }

  const projectId = document.getElementById('projectId').value;
  const title = document.getElementById('projectTitle').value.trim();
  const category = document.getElementById('projectCategory').value.trim();
  const imageUrl = document.getElementById('projectImage').value.trim();
  const description = document.getElementById('projectDescription').value.trim();

  if (!title || !category || !imageUrl || !description) {
    alert('Please complete all project fields.');
    return;
  }

  const payload = {
    title,
    category,
    image_url: imageUrl,
    description
  };

  let operation;

  if (projectId) {
    operation = supabase.from('projects').update(payload).eq('id', projectId);
  } else {
    operation = supabase.from('projects').insert(payload);
  }

  const { error } = await operation;

  if (error) {
    alert(error.message);
    return;
  }

  resetProjectForm();
  await refreshProjects();
}

async function handleProjectDelete(projectId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) {
    alert(error.message);
    return;
  }

  await refreshProjects();
}

async function bindAdminEvents() {
  const adminToggle = document.getElementById('adminToggle');
  const loginForm = document.getElementById('loginForm');
  const projectForm = document.getElementById('projectForm');
  const projectList = document.getElementById('projectList');
  const logoutBtn = document.getElementById('logoutBtn');
  const resetBtn = document.getElementById('resetProjectForm');
  const closeButtons = document.querySelectorAll('[data-close="login"]');

  if (!adminToggle || !loginForm || !projectForm || !projectList) return;

  adminToggle.addEventListener('click', async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      alert('Configure Supabase first.');
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      document.getElementById('adminPanel').classList.remove('hidden');
      adminToggle.textContent = 'Admin On';
    } else {
      document.getElementById('adminLoginModal').classList.remove('hidden');
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById('adminLoginModal').classList.add('hidden');
    });
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  projectForm.addEventListener('submit', handleProjectSave);
  resetBtn.addEventListener('click', resetProjectForm);

  projectList.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === 'delete' && id) {
      await handleProjectDelete(id);
      return;
    }

    if (action === 'edit' && id) {
      const projects = await fetchProjects();
      const project = projects.find((item) => item.id === id);
      if (project) {
        populateProjectForm(project);
        document.getElementById('projectTitle').focus();
      }
    }
  });
}

async function initializePortfolio() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    renderProjectGrid(DEFAULT_PROJECTS.map(normalizeProject));
    renderAdminProjectList(DEFAULT_PROJECTS.map(normalizeProject));
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const isLoggedIn = Boolean(sessionData?.session);
  toggleAdminVisibility(isLoggedIn, document.getElementById('adminToggle'));

  supabase.auth.onAuthStateChange((event, session) => {
    const loggedIn = Boolean(session);
    toggleAdminVisibility(loggedIn, document.getElementById('adminToggle'));
  });

  await refreshProjects();
}

window.addEventListener('DOMContentLoaded', async () => {
  await initializePortfolio();
  bindAdminEvents();
});
