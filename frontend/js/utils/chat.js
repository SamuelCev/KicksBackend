
// ============================================
// IMPORTAR FUNCIÓN DE LA API
// ============================================
import { inferenceAIAssistant } from './auth.js';

// ============================================
// CHAT - REFERENCIAS AL DOM
// ============================================
const chatFab = document.getElementById('chatFab');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const clearChat = document.getElementById('clearChat');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');

// ============================================
// CHAT - HISTORIAL DE CONVERSACIÓN
// ============================================
let conversationHistory = [];

// ============================================
// CHAT - AUTO-RESIZE DEL TEXTAREA
// ============================================
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Event listener para auto-resize mientras escribes
messageInput.addEventListener('input', autoResizeTextarea);

// Event listener para permitir Enter para enviar (Shift+Enter para nueva línea)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// ============================================
// CHAT - ABRIR Y CERRAR MODAL
// ============================================
function openChatModal() {
    chatModal.classList.add('active');
    messageInput.focus(); // Pone el cursor en el input
}

function closeChatModal() {
    chatModal.classList.remove('active');
}

// Event listeners para abrir/cerrar
chatFab.addEventListener('click', openChatModal);
closeChat.addEventListener('click', closeChatModal);

// Cerrar al hacer click fuera del chat
chatModal.addEventListener('click', (e) => {
    if (e.target === chatModal) {
        closeChatModal();
    }
});

// ============================================
// CHAT - CARGAR HISTORIAL DESDE LOCALSTORAGE
// ============================================
function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    
    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        
        // Renderizar todos los mensajes guardados
        conversationHistory.forEach(message => {
            if (message.role === 'user') {
                addMessageToUI(message.content, 'user', false);
            } else if (message.role === 'assistant') {
                addMessageToUI(message.content, 'ai', false);
            }
        });
        
        // Scroll al final
        scrollToBottom();
    } else {
        // Si no hay historial, crear mensaje de bienvenida
        const welcomeMessage = {
            role: 'assistant',
            content: '¡Hola! 👋 Soy Kicksy, tu asistente en Kicks. ¿En qué puedo ayudarte hoy?'
        };
        
        // Agregar al historial
        conversationHistory.push(welcomeMessage);
        
        // Guardar en localStorage
        saveChatHistory();
        
        // Mostrar en la UI
        addMessageToUI(welcomeMessage.content, 'ai', false);
    }
}

// ============================================
// CHAT - GUARDAR HISTORIAL EN LOCALSTORAGE
// ============================================
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

// Cargar historial cuando se abre la página
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
});

// ============================================
// CHAT - AGREGAR MENSAJE A LA INTERFAZ
// ============================================
function addMessageToUI(content, type, shouldSave = true) {
    // Crear elemento del mensaje
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', type);
    
    // Crear la burbuja del mensaje
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.textContent = content;
    
    // Crear timestamp (hora)
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    const now = new Date();
    timeDiv.textContent = now.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Ensamblar el mensaje
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timeDiv);
    
    // Agregar al contenedor de mensajes
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final
    scrollToBottom();
    
    // Guardar en el historial si es necesario
    if (shouldSave) {
        const role = type === 'user' ? 'user' : 'assistant';
        conversationHistory.push({ role, content });
        saveChatHistory();
    }
}

// ============================================
// CHAT - SCROLL AL FINAL
// ============================================
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================
// CHAT - LIMPIAR CONVERSACIÓN
// ============================================
async function clearConversation() {
    // Preguntar confirmación al usuario con SweetAlert
    const result = await Swal.fire({
        title: '¿Eliminar conversación?',
        text: '¿Estás seguro de que quieres borrar toda la conversación? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d01110',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
    });
    
    if (result.isConfirmed) {
        // Limpiar historial
        conversationHistory = [];
        
        // Limpiar localStorage
        localStorage.removeItem('chatHistory');
        
        // Limpiar UI
        chatMessages.innerHTML = '';
        
        // Mostrar mensaje de éxito
        await Swal.fire({
            title: '¡Eliminado!',
            text: 'La conversación ha sido eliminada.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        
        console.log('Conversación limpiada');
        loadChatHistory();
    }
}

// Event listener para el botón de limpiar
clearChat.addEventListener('click', clearConversation);

// ============================================
// CHAT - ENVIAR MENSAJE
// ============================================
async function sendMessage(e) {
    e.preventDefault(); // Evita que el form recargue la página
    
    const userMessage = messageInput.value.trim();
    
    // Validar que el mensaje no esté vacío
    if (!userMessage) return;
    
    // Limpiar el input
    messageInput.value = '';
    
    // Resetear altura del textarea
    messageInput.style.height = 'auto';
    
    // Mostrar mensaje del usuario
    addMessageToUI(userMessage, 'user');
    
    // Deshabilitar input mientras se procesa
    messageInput.disabled = true;
    chatForm.querySelector('.chat-send-btn').disabled = true;
    
    // Mostrar indicador de "escribiendo..."
    const typingIndicator = showTypingIndicator();
    
    try {
        // Llamar a la API con todo el historial
        const response = await inferenceAIAssistant(conversationHistory);
        
        // Remover indicador de "escribiendo..."
        removeTypingIndicator(typingIndicator);
        
        // Verificar si la respuesta fue exitosa
        if (response.ok && response.response) {
            // Mostrar respuesta de la IA
            addMessageToUI(response.response.content, 'ai');
        } else {
            // Mostrar error
            addMessageToUI('Lo siento, hubo un error al procesar tu mensaje.', 'ai');
            console.error('Error en la respuesta:', response.error);
        }
        
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        addMessageToUI('Error de conexión. Por favor intenta de nuevo.', 'ai');
        console.error('Error al enviar mensaje:', error);
    } finally {
        // Re-habilitar input
        messageInput.disabled = false;
        chatForm.querySelector('.chat-send-btn').disabled = false;
        messageInput.focus();
    }
}

// Event listener para el formulario
chatForm.addEventListener('submit', sendMessage);

// ============================================
// CHAT - INDICADOR DE ESCRIBIENDO
// ============================================
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('chat-message', 'ai', 'typing-indicator');
    typingDiv.id = 'typingIndicator';
    
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    
    // Crear los 3 puntos animados
    const dots = document.createElement('div');
    dots.classList.add('typing-dots');
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    bubble.appendChild(dots);
    typingDiv.appendChild(bubble);
    chatMessages.appendChild(typingDiv);
    
    scrollToBottom();
    
    return typingDiv;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}