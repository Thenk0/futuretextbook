import { Scene } from "three";
import * as THREE from "three";
import { OrbitControls } from '../OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import DragControls from "../drag-controls";
import { Group } from "three";
export default class MediaScene extends Scene {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.active = false;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4000);
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.position.set(0, 0, 10);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas});
        this.renderer.setSize(window.innerWidth / window.innerHeight);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.dragControls = new DragControls([], this.camera, this.renderer.domElement)
        this.loader = new THREE.TextureLoader();
        this.frameElementsGroup = new Group();
        const color = 0xffffff;
        const intensity = 1;
        // this.light = this._createLightOnScene(color, intensity)

        this.loader3d = new GLTFLoader();
        this.i = 0;
        this.pI = 0;
        this.redMaterial = new THREE.MeshPhongMaterial({ color: 0x550000 })
        this.redMaterial.depthTest = false;
        this.redMaterial.depthWrite = false;

        this.isAnnotated3d = false;
        this.lockHighlight = false;
        this.highlightModelMethod = this.highlightModel.bind(this);
        this.onHoverEnterMethod = this._onHoverEnter.bind(this);
        this.onHoverLeaveMethod = this._onHoverLeave.bind(this);
        this.onClickMethod = this._onClick.bind(this);
    }
    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.render();
    }

    _createLightOnScene(color, intensity){
        let light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
        
        light = new THREE.PointLight(color, intensity);
        light.position.set(0, 500, 0);
        this.scene.add(light);
        
        light = new THREE.PointLight(color, intensity);
        light.position.set(500, 0, 0);
        this.scene.add(light);

        light = new THREE.PointLight(color, intensity);
        light.position.set(0, 0, 500);
        this.scene.add(light);

        light = new THREE.PointLight(color, intensity);
        light.position.set(0, -500, 0);
        this.scene.add(light);

        light = new THREE.PointLight(color, intensity);
        light.position.set(-500, 0, 0);
        this.scene.add(light);

        light = new THREE.PointLight(color, intensity);
        light.position.set(0, 0, -500);

        return light;
    }

    async load3d(objUrl, annotated = false) {
        if (this.scene.children) this.scene.clear();
        this.dragControls.deactivate();
        await this.loader3d.load(objUrl, (function (gltf) {
            this.mesh = gltf.scene;
            for (const mesh of this.mesh.children) {
                mesh.renderOrder = 0;
            }
            this.scene.add(this.mesh);
            this.scene.add(this._createLightOnScene(0xffffff, 1));
            if (annotated) this.loadAnnotations();
        }).bind(this));
        this.controls.enabled = true;
        this.controls.target.set(0, 0, 0);
        this.camera.position.set(0, 0, 300);
        this.controls.update();
    }

    loadAnnotations() {
        this.isAnnotated3d = true;
        const children = this.mesh.children;
        const buttonsElement = document.getElementById('media-buttons');
        let i = 0;
        for (const child of children) {
            const div = document.createElement('div');
            div.setAttribute('modelindex', i.toString())
            div.classList.add("media-button");
            div.onmouseenter = this.onHoverEnterMethod;
            div.innerText = child.name.replaceAll("_", " ");
            div.onmouseleave = this.onHoverLeaveMethod;
            div.onclick = this.onClickMethod;
            buttonsElement.append(div);
            i++;
        }
        buttonsElement.style.display = "block";
    }

    unloadAnnotations() {
        this.isAnnotated3d = false;
    }

    _onHoverEnter(event) {
        const index = parseInt(event.target.getAttribute('modelindex'));
        this._highlightSingle(index);
    }

    _onHoverLeave(event) {
        const index = parseInt(event.target.getAttribute('modelindex'));
        this._removeHightlight(index);
    }

    _onClick(event) {
        const index = parseInt(event.target.getAttribute('modelindex'));
        this._setLock(index);
    }

    _highlightSingle(index) {
        if (this.lockHighlight) return;
        const children = this.mesh.children;
        if (children[index].children.length > 0) {
            this.oldMaterial = children[index].children.map(child => child.material);
            for (const child of children[index].children) {
                child.material = this.redMaterial;
                child.material = this.redMaterial;
                child.renderOrder = 999;
            }
        } else {
            this.oldMaterial = children[index].material
            children[index].material = this.redMaterial;
            children[index].renderOrder = 999;
        }
    }

    _removeHightlight(index) {
        if (this.lockHighlight) return;
        const children = this.mesh.children;
        if (this.oldMaterial) {
            if (children[index].children.length > 0) {
                for (let i = 0; i < children[index].children.length; i++) {
                    const child = children[index].children[i];
                    child.material = this.oldMaterial[i];
                    child.renderOrder = 0;
                }
            } else {
                children[index].material = this.oldMaterial;
                children[index].renderOrder = 0;
            }
        }
    }

    _setLock(index) {
        this.lockHighlight = !this.lockHighlight;
        const buttons = document.querySelectorAll('.media-button');
        if (this.lockHighlight) {
            buttons[index].style.color = "cornflowerblue";
            this.lockedIndex = index;
            return;
        }
        buttons[this.lockedIndex].style.color = "white";
        this._removeHightlight(this.lockedIndex);
        this._highlightSingle(index);
    }

    highlightModel() {
        if (typeof this.mesh === "undefined") return;
        if (this.lockHighlight) return;
        const children = this.mesh.children;
        if (this.i >= children.length - 1) {
            this.i = 0;
        }
        if (this.oldMaterial) {
            if (children[this.pI].children.length > 0) {
                for (let i = 0; i < children[this.pI].children.length; i++) {
                    const child = children[this.pI].children[i];
                    child.material = this.oldMaterial[i];
                    child.renderOrder = 0;
                }
            } else {
                children[this.pI].material = this.oldMaterial;
                children[this.pI].renderOrder = 0;
            }
        }
        if (children[this.i].children.length > 0) {
            this.oldMaterial = children[this.i].children.map(child => child.material);
            for (const child of children[this.i].children) {
                child.material = this.redMaterial;
                child.renderOrder = 999;
            }
        } else {
            this.oldMaterial = children[this.i].material
            children[this.i].material = this.redMaterial;
            children[this.i].renderOrder = 999;
        }
        this.pI = this.i;
        this.i++;
    }

    async loadImage(imgurl, is_flat) {
        if (this.scene.children) this.scene.clear();
        this.loader.load(imgurl, (function (texture) {
            if(is_flat)
                this._loadFrame(texture)
            else
                this._loadPanorama(texture)
        }).bind(this));
        this.controls.enabled = true;
        this.dragControls.deactivate();
        this.controls.target.set(0, 0, 0);
        this.camera.position.set(0, 0, 10);
        this.controls.update();
    }

    _loadFrame(texture){
        const MIN_WIDTH = 15;
        const MIN_HEIGHT = 15;
        this.scene.remove.apply(this.scene, this.scene.children);
        this.controls.enabled = false;
        this.dragControls.activate();
        this.dragControls.objects = [];
        const planeGeometry = new THREE.PlaneGeometry(MIN_WIDTH,MIN_HEIGHT);
        const planeMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
        mesh.updateMatrixWorld();
        this.group = new THREE.Group();
        this.group.userData.isFrame = true;
        this.group.add(mesh);
        this.group.position.z = 0;
        this.scene.add(this.group);
        this.group.userData.height = MIN_HEIGHT;
        this.group.userData.width = MIN_WIDTH;
        this.dragControls.objects.push(this.group);
        this.dragControls._focused = this.group;
        this._createMenuItems(128, 64);
        this._getFrameElement();
    }

    _getFrameElement(){
        const frameMenu = document.getElementById("frame-elements");
        let itemID;
        let mesh;
        let counter = 0;
        frameMenu.onclick = (event) => 
        {
            itemID = event.target.getAttribute("item-id");
            const texture = this.loader.load(window.frameElements[itemID]);
            texture.format = THREE.RGBAFormat;
            const itemGeometry = new THREE.PlaneGeometry(1.8,1.15);
            const material = new THREE.MeshBasicMaterial({
                map: texture, 
                side: THREE.FrontSide, 
                transparent: true,
            });
            mesh = new THREE.Mesh(itemGeometry, material);
            const group = new THREE.Group();
            group.add(mesh);
            group.userData.isFrameElement = true;
            group.userData.elementId = counter
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            group.position.x = mouse.x / 2;
            group.position.y = mouse.y / 2;
            group.position.z = 2;
            this.dragControls.objects.push(group);
            this.scene.add(group);
            this.dragControls._selected = group;
            this.dragControls._focused = group;
            this.dragControls._started = true;
            counter++;
        }
    }


    // Создание меню с элементами, которые можно разместить на карте
    _createMenuItems(width, height){
        const sliderImages = document.getElementById('frame-elements');
        window.frameElements.forEach(function(image, index) {
            let li = document.createElement('li');
            let img = document.createElement('img');
            img.src = image;
            img.style.width = width + 'px'; // Применяем переданные ширину и высоту
            img.style.height = height + 'px';
            li.appendChild(img);
            sliderImages.appendChild(li);
            img.setAttribute("item-id", index.toString());
        });
        document.querySelector(".frame__menu").style.display = "flex"
    }

    
    
    _loadPanorama(texture){
        this.controls.enabled = true;
        this.dragControls.deactivate();
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40)
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
        sphereGeometry.scale(-1, 1, 1);
        this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.mesh);
        this.mesh.position.set(0, 0, 0);
    }


    action() { }

    activate() {
        this.canvas.style.pointerEvents = "auto";
        this.active = true;
        this.render();
        this.renderer.domElement.style.display = "block";
    }

    deactivate() {
        this.canvas.style.pointerEvents = "none";
        this.active = false;
        this.renderer.domElement.style.display = "none";
        document.getElementById('media-buttons').innerHTML = null;
        document.getElementById('media-buttons').style.display = 'none'
        const frameMenu = document.getElementById("frame__menu");
        if(frameMenu){
            frameMenu.innerHTML = null;
            frameMenu.style.display = "none";
        }
    }

    _resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }


    render() {
        if (!this.active) return;
        if (this._resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer == null) return;
        this.renderer.render(this.scene, this.camera);
    }
    
}
