/* 
  Twitter Lara - El motor (app.js)
  Maneja navegación y conexión a Supabase.
*/

// 1. Inicializar Supabase (con protección)
let db;
try {
    // @ts-ignore
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase inicializado correctamente");
} catch (e) {
    console.error("Error al inicializar Supabase:", e);
    alert("Error de conexión. Revisa tus claves en config.js");
}

// 2. Identificación anónima
if (!localStorage.getItem('device_id')) {
    localStorage.setItem('device_id', 'user_' + Math.random().toString(36).substring(2, 11));
}
const deviceId = localStorage.getItem('device_id');

// 3. Router y Vistas
function handleNavigation() {
    console.log("Navegando a:", window.location.hash);
    const hash = window.location.hash || '#';
    const content = document.getElementById('content');

    // Limpiar navegación activa
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    if (hash === '#new') {
        const navNew = document.getElementById('nav-new');
        if (navNew) navNew.classList.add('active');
        renderNewPostForm();
    } else {
        const navFeed = document.getElementById('nav-feed');
        if (navFeed) navFeed.classList.add('active');
        renderFeed();
    }
}

async function renderFeed() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="feed-container" id="posts-list">
            <p style="padding: 20px; color: var(--text-dim);">Cargando tweets...</p>
        </div>
    `;

    try {
        // 1. Traer posts
        const { data: posts, error: postsError } = await db
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // 2. Traer todos los likes para contar
        const { data: allLikes, error: likesError } = await db
            .from('likes')
            .select('post_id, device_id');

        if (likesError) throw likesError;

        const postsList = document.getElementById('posts-list');
        if (posts.length === 0) {
            postsList.innerHTML = '<p style="padding: 20px; color: var(--text-dim);">No hay tweets aún. ¡Sé el primero en publicar!</p>';
            return;
        }

        postsList.innerHTML = posts.map(post => {
            const postLikes = allLikes.filter(l => l.post_id === post.id);
            const hasLiked = postLikes.some(l => l.device_id === deviceId);

            return `
                <article class="post-card">
                    <div class="post-author">
                        Usuario <span>@${post.author_id.substring(5, 12)}</span>
                        ${post.author_id === deviceId ? ' <span style="font-size: 0.7rem; color: var(--accent);">(Tú)</span>' : ''}
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="action-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}', ${hasLiked})">
                            ${hasLiked ? '❤️' : '🤍'} ${postLikes.length}
                        </button>
                        ${post.author_id === deviceId ? `<button class="action-btn btn-delete" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
                    </div>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error("Error al cargar feed:", err);
        document.getElementById('posts-list').innerHTML = `<p style="color: #f4212e; padding: 20px;">Error al cargar: ${err.message}</p>`;
    }
}

function renderNewPostForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="new-post-container">
            <textarea id="post-text" placeholder="¿Qué está pasando?" maxlength="280"></textarea>
            <div style="border-top: 1px solid var(--glass-border); padding-top: 15px; margin-top: 10px; overflow: hidden;">
                <button id="btn-publish" class="btn-publish" disabled>Publicar</button>
            </div>
        </div>
    `;

    const textarea = document.getElementById('post-text');
    const btn = document.getElementById('btn-publish');

    if (textarea && btn) {
        textarea.focus();
        textarea.addEventListener('input', () => {
            btn.disabled = textarea.value.trim().length === 0;
        });

        btn.addEventListener('click', () => publishPost(textarea.value));
    }
}

// 4. Funciones de Base de Datos
async function publishPost(text) {
    const btn = document.getElementById('btn-publish');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Publicando...";
    }

    try {
        const { error } = await db
            .from('posts')
            .insert([{ content: text, author_id: deviceId }]);

        if (error) throw error;
        window.location.hash = '#';
    } catch (err) {
        alert("Error al publicar: " + err.message);
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Publicar";
        }
    }
}

async function deletePost(id) {
    if (!confirm("¿Seguro que quieres borrar este tweet?")) return;

    try {
        const { error } = await db
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        renderFeed();
    } catch (err) {
        alert("Error al borrar: " + err.message);
    }
}

async function toggleLike(postId, alreadyLiked) {
    try {
        if (alreadyLiked) {
            // Quitar el corazón
            await db.from('likes').delete().match({ post_id: postId, device_id: deviceId });
        } else {
            // Poner el corazón
            await db.from('likes').insert([{ post_id: postId, device_id: deviceId }]);
        }
        // Refrescar el feed para ver el cambio inmediatamente
        renderFeed();
    } catch (err) {
        console.error("Error con el like:", err);
    }
}

// Iniciar
window.addEventListener('hashchange', handleNavigation);
window.addEventListener('load', handleNavigation);
window.deletePost = deletePost;
window.toggleLike = toggleLike;
