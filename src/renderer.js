const { ipcRenderer } = require('electron');
const draggable = document.getElementById('draggable');

draggable.addEventListener('dragstart', (event) => {
    const dragImage = document.createElement('img');
    dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgMBAp9lX2sAAAAASUVORK5CYII=';
    dragImage.style.visibility = 'hidden';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    const bounds = event.target.getBoundingClientRect();
    event.dataTransfer.setData('application/json', JSON.stringify({
        offsetX: event.clientX - bounds.left,
        offsetY: event.clientY - bounds.top,
    }));

    setTimeout(() => document.body.removeChild(dragImage), 0);
});

window.addEventListener('dragend', (event) => {
    const screenX = event.screenX;
    const screenY = event.screenY;

    ipcRenderer.send('create-new-window', { x: screenX, y: screenY });
});

document.getElementById('KeepONtop').addEventListener('click', () => {
    ipcRenderer.send('Keepontop', 'Keep on top featured!');
});

// Runtime & OS Detection
const detectEnvironment = () => {
    const isElectron = window.electronAPI !== undefined;
    const runtime = isElectron ? 'electron' : 'web';
    
    // Get OS info
    let os = 'unknown';
    if (isElectron) {
        const osInfo = window.electronAPI.getOSInfo();
        os = osInfo.platform;
        console.log('[Electron Runtime]', osInfo);
    } else {
        os = navigator.platform.toLowerCase();
        if (os.includes('win')) os = 'win32';
        else if (os.includes('mac')) os = 'darwin';
        else if (os.includes('linux')) os = 'linux';
        console.log('[Web Runtime] Platform:', os);
    }

    // Apply to document
    document.documentElement.setAttribute('data-runtime', runtime);
    document.documentElement.setAttribute('data-os', os);
    
    // Add runtime-specific listeners
    if (isElectron) {
        setupElectronFeatures();
    } else {
        setupWebFeatures();
    }
};

const setupElectronFeatures = () => {
    // Electron-specific features
    document.getElementById('KeepONtop')?.addEventListener('click', () => {
        window.electronAPI.keepOnTop();
    });

    window.electronAPI.onOSInfo((info) => {
        console.log('[Electron] OS Info:', info);
    });
};

const setupWebFeatures = () => {
    // Web-specific features
    const electronElements = document.querySelectorAll('.electron-only');
    electronElements.forEach(el => el.style.display = 'none');
    
    // Replace electron features with web alternatives
    document.getElementById('KeepONtop')?.remove();
};

// System info handler
window.electronAPI.onSystemInfo((info) => {
    console.group('System Information');
    console.log('Runtime:', info.runtime.name);
    console.log('Platform:', info.platform.name);
    console.log('Details:', info.details);
    console.groupEnd();

    // Apply system-specific classes
    document.documentElement.setAttribute('data-runtime', info.runtime.type);
    document.documentElement.setAttribute('data-os', info.platform.type);
    
    // Apply platform-specific UI adjustments
    if (info.platform.controls === 'left') {
        document.body.classList.add('controls-left');
    } else if (info.platform.controls === 'right') {
        document.body.classList.add('controls-right');
    }
});

// OS Detection for CSS
document.addEventListener('DOMContentLoaded', () => {
    const platform = window.runtimeInfo?.os || 'unknown';
    document.documentElement.setAttribute('data-os', platform);
    document.body.classList.add(`os-${platform === 'darwin' ? 'mac' : platform === 'win32' ? 'windows' : 'linux'}`);
});

// Initialize environment detection
document.addEventListener('DOMContentLoaded', detectEnvironment);
