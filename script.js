const ADMIN_CREDENTIALS = {
  username: 'romitadmin',
  password: 'romit123'
};

const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Urban Housing Complex',
    category: 'Residential / 2025',
    imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80',
    description: 'A mixed-income housing prototype designed around daylight, social interaction, and climate-sensitive planning.'
  },
  {
    id: 'p2',
    title: 'Cultural Learning Hub',
    category: 'Institutional / 2024',
    imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    description: 'A civic space that blends public library, exhibition gallery, and community classrooms into one porous campus.'
  },
  {
    id: 'p3',
    title: 'Coastal Habitat Studio',
    category: 'Adaptive Reuse / 2023',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'A resilient coastal retreat exploring vernacular rhythms, natural ventilation, and low-impact material use.'
  }
];

const STORAGE = {
  projects: 'portfolioProjects',
  adminSession: 'portfolioAdminSession'
};

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

function loadProjects() {
  const saved = localStorage.getItem(STORAGE.projects);

  if (!saved) {
    localStorage.setItem(STORAGE.projects, JSON.stringify(DEFAULT_PROJECTS));
    return [...DEFAULT_PROJECTS];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_PROJECTS];
  } catch (error) {
    localStorage.setItem(STORAGE.projects, JSON.stringify(DEFAULT_PROJECTS));
    return [...DEFAULT_PROJECTS];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE.projects, JSON.stringify(projects));
}

function renderProjects() {
  const projectGrid = document.getElementById('portfolioProjectsGrid');
  if (!projectGrid) return;

  const projects = loadProjects();

  projectGrid.innerHTML = projects.map((project) => `
    <article class="project-card">
      <img src="${project.imageUrl}" alt="${project.title}" />
      <div class="project-info">
        <span>${project.category}</span>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    </article>
  `).join('');
}

function renderAdminProjectList() {
  const projectList = document.getElementById('projectList');
  if (!projectList) return;

  const projects = loadProjects();

  if (!projects.length) {
    projectList.innerHTML = '<p class="empty-state">No projects added yet.</p>';
    return;
  }

  projectList.innerHTML = projects.map((project) => `
    <div class="project-list-item" data-id="${project.id}">
      <div>
        <strong>${project.title}</strong>
        <small>${project.category}</small>
      </div>
      <div class="list-actions">
        <button type="button" class="edit-btn" data-action="edit" data-id="${project.id}">Edit</button>
        <button type="button" class="delete-btn" data-action="delete" data-id="${project.id}">Delete</button>
      </div>
    </div>
  `).join('');
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
  imageInput.value = project.imageUrl;
  descriptionInput.value = project.description;
}

function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
}

function showAdminPanel(show) {
  const panel = document.getElementById('adminPanel');
  const modal = document.getElementById('adminLoginModal');
  if (!panel || !modal) return;

  panel.classList.toggle('hidden', !show);
  modal.classList.toggle('hidden', show || !modal.classList.contains('hidden'));
}

function isLoggedIn() {
  return localStorage.getItem(STORAGE.adminSession) === 'true';
}

function toggleAdminAccess() {
  const adminPanel = document.getElementById('adminPanel');
  const adminToggle = document.getElementById('adminToggle');
  if (!adminPanel || !adminToggle) return;

  if (isLoggedIn()) {
    adminPanel.classList.remove('hidden');
    adminToggle.textContent = 'Admin On';
  } else {
    adminPanel.classList.add('hidden');
    adminToggle.textContent = 'Admin';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderAdminProjectList();
  toggleAdminAccess();

  const adminToggle = document.getElementById('adminToggle');
  const loginForm = document.getElementById('loginForm');
  const projectForm = document.getElementById('projectForm');
  const projectList = document.getElementById('projectList');
  const logoutBtn = document.getElementById('logoutBtn');
  const resetProjectFormBtn = document.getElementById('resetProjectForm');
  const closeButtons = document.querySelectorAll('[data-close="login"]');

  adminToggle.addEventListener('click', () => {
    if (isLoggedIn()) {
      document.getElementById('adminPanel').classList.remove('hidden');
    } else {
      document.getElementById('adminLoginModal').classList.remove('hidden');
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById('adminLoginModal').classList.add('hidden');
    });
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem(STORAGE.adminSession, 'true');
      document.getElementById('adminLoginModal').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      adminToggle.textContent = 'Admin On';
      loginForm.reset();
      return;
    }

    alert('Invalid username or password.');
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.setItem(STORAGE.adminSession, 'false');
    document.getElementById('adminPanel').classList.add('hidden');
    adminToggle.textContent = 'Admin';
  });

  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('projectTitle').value.trim();
    const category = document.getElementById('projectCategory').value.trim();
    const imageUrl = document.getElementById('projectImage').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const projectId = document.getElementById('projectId').value;

    if (!title || !category || !imageUrl || !description) {
      alert('Please complete all project fields.');
      return;
    }

    const projects = loadProjects();

    if (projectId) {
      const updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...project, title, category, imageUrl, description }
          : project
      );
      saveProjects(updatedProjects);
    } else {
      const newProject = {
        id: `project-${Date.now()}`,
        title,
        category,
        imageUrl,
        description
      };
      saveProjects([newProject, ...projects]);
    }

    resetProjectForm();
    renderProjects();
    renderAdminProjectList();
  });

  resetProjectFormBtn.addEventListener('click', () => {
    resetProjectForm();
  });

  projectList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const projectId = button.dataset.id;
    const action = button.dataset.action;
    const projects = loadProjects();

    if (action === 'delete') {
      const filtered = projects.filter((project) => project.id !== projectId);
      saveProjects(filtered);
      renderProjects();
      renderAdminProjectList();
      return;
    }

    if (action === 'edit') {
      const project = projects.find((item) => item.id === projectId);
      if (project) {
        populateProjectForm(project);
        document.getElementById('projectTitle').focus();
      }
    }
  });
});
