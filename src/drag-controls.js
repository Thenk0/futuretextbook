import * as THREE from "three";
import { EventDispatcher } from "three";
import { clamp } from "./utilities";
import { Raycaster } from "three";
import { Vector3 } from "three";

export default class DragControls extends EventDispatcher {
    constructor(objects, camera, domElement) {
        super();
        this._plane = new THREE.Plane();
        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this._offset = new THREE.Vector3();
        this._intersection = new THREE.Vector3();
        this._selected = null;
        this._hovered = null;
        this._started = false;
        this._focused = null;
        this._isPageDropped = false;
        this.objects = objects;
        this.enabled = true;
        this.camera = camera;
        this.domElement = domElement;
        this.frameGroup = null;

        this.onDocumentMouseDown = this._onDocumentMouseDown.bind(this);
        this.onDocumentMouseMove = this._onDocumentMouseMove.bind(this);
        this.onDocumentMouseCancel = this._onDocumentMouseCancel.bind(this);
        this.onDocumentTouchStart = this._onDocumentTouchStart.bind(this);
        this.onDocumentTouchMove = this._onDocumentTouchMove.bind(this);
        this.onDocumentTouchEnd = this._onDocumentTouchEnd.bind(this);
        this.onScroll = this._onScroll.bind(this);

        this.activate();
    }

    _onDocumentMouseDown(event) {
        event.preventDefault();
        this._raycaster.setFromCamera(this._mouse, this.camera);
        const intersects = this._raycaster.intersectObjects(this.objects);

        if (this._started) {
            //  Прекращение передвижения объекта
            this._focused = this._selected;
            this._started = false;
            if (event.clientX < 400 && !this._focused.userData.isFrameElement) {
                this.dispatchEvent({
                    type: "pagedrop",
                    object: {
                        page: this._selected.children[0].userData.pageNumber,
                        click: {
                            x: event.clientX,
                            y: event.clientY,
                        },
                    },
                });
                this.domElement.style.cursor = "auto";
                this._isPageDropped = true;
            }
            this._selected = null;
            return;
        }
        if (intersects.length == 0) {
            return;
        }

        if (intersects[0].object.parent.userData.isFrame) {
            this.frameGroup = intersects[0].object.parent;
            this.objects.forEach((elem, index) => {
                if (index != 0 && !this.frameGroup.children.includes(elem)) {
                    elem.matrixAutoUpdate = false;
                    this.frameGroup.attach(elem);
                }
            });
            console.log(this.frameGroup)
        }

        if (
            intersects[0].object.parent.userData.isFrameElement &&
            this.frameGroup.children.length > 1
        ) {
            const removedObject = intersects[0].object.parent.removeFromParent();
            const offsetVec = new Vector3();
            removedObject.position.sub(offsetVec.copy(this.frameGroup.position).multiplyScalar(-1));
            
            removedObject.updateMatrix();
            this.frameGroup.parent.add(removedObject);
            
        }

        this._selected = intersects[0].object.parent;
        if (this._selected.position.x == -4 && this._selected.position.y == 3) {
            // Устанавливает прежний размер застаканной страницы
            this._selected.scale.x = 1;
            this._selected.scale.y = 1;
        }
        if (
            this._focused?.userData.isFrameElement &&
            this._selected?.userData.isFrame
        )
            this._focused = this._selected;

        if (intersects.length > 1 && this._selected === this._focused) {
            if (
                !this._focused.userData.isFrame &&
                !this._focused.userData.isFrameElement
            )
                this._selected = null;
            // Выбрать передний элемент, если они пересекаются
            if (
                intersects[0].object.userData.pageNumber !==
                intersects[1].object.userData.pageNumber
            ) {
                this._selected = intersects[0].object.parent;
                this._focused = this._selected;
                this._started = true;
                if (
                    this._raycaster.ray.intersectPlane(
                        this._plane,
                        this._intersection
                    )
                ) {
                    this._offset
                        .copy(this._intersection)
                        .sub(this._selected.position);
                }
                this.domElement.style.cursor = "move";
                return;
            }
            if (
                !this._focused.userData.isFrame &&
                !this._focused.userData.isFrameElement
            ) {
                let index = 1;
                if ("mediaType" in intersects[0].object.userData) {
                    index = 0;
                }
                console.log("im trying to media");
                const { pageNumber, mediaType, mediaIndex } =
                    intersects[index].object.userData;
                return this.dispatchEvent({
                    //  Запустить медию
                    type: "mediastart",
                    object: {
                        pageNumber,
                        mediaType,
                        mediaIndex,
                    },
                });
            }
            if (intersects[0].object.parent.userData.isFrame) {
                this._selected = intersects[1].object.parent;
                this._focused = intersects[1].object.parent;
            } else this._focused = this._selected;
        } else if (intersects.length > 1 && this._selected !== this._focused) {
            if (intersects[0].object.parent.userData.isFrame) {
                this._selected = intersects[1].object.parent;
                this._focused = intersects[1].object.parent;
            }
        }
        this._started = true;
        if (
            this._focused !== null &&
            !this._focused.userData.isFrameElement &&
            !this._focused.userData.isFrame
        ) {
            // Если объект не зафокусирован, поставить его за фокусированный
            this._focused.children.forEach((child) => {
                child.position.z = child.userData.zPosition;
                child.renderOrder = child.userData.renderOrder;
            });
            this._focused = this._selected;
            this._focused.children.forEach((child) => {
                child.position.z = 0;
                child.renderOrder = 1;
            });
        }
        if (
            this._raycaster.ray.intersectPlane(this._plane, this._intersection)
        ) {
            this._offset.copy(this._intersection).sub(this._selected.position);
        }
        this.domElement.style.cursor = "move";
        this._isPageDropped = false;
    }

    _onDocumentMouseMove(event) {
        event.preventDefault();

        const rect = this.domElement.getBoundingClientRect();

        this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this.camera);

        if (this._selected && this.enabled) {
            if (
                this._raycaster.ray.intersectPlane(
                    this._plane,
                    this._intersection
                )
            ) {
                this._selected.position.copy(
                    this._intersection.sub(this._offset)
                );
                if (!this._selected.matrixAutoUpdate) {
                    this._selected.updateMatrix();
                }
                // здесь нужно ограничить перемещение за экран
            }
            return;
        }
        this._raycaster.setFromCamera(this._mouse, this.camera);
        const intersects = this._raycaster.intersectObjects(this.objects);
        if (intersects.length == 0) {
            if (this._hovered !== null) {
                this.domElement.style.cursor = "auto";
                this._hovered = null;
            }
            return;
        }
        const object = intersects[0].object;
        this._plane.setFromNormalAndCoplanarPoint(
            this.camera.getWorldDirection(this._plane.normal),
            object.position
        );

        if (this._hovered !== object) {
            if (object.parent.userData.isFrame) {
                this.domElement.style.cursor = "move";
            } else this.domElement.style.cursor = "pointer";

            this._hovered = object;
        }
    }

    _returnToPosition() {}

    _onDocumentMouseCancel(event) {
        event.preventDefault();
        if (this._hovered && !this._selected)
            this.domElement.style.cursor = "pointer";
    }

    getFocused() {
        return this._focused;
    }

    resetPage() {
        if (this._selected) {
            this._selected.children.forEach((child) => {
                child.position.z = child.userData.zPosition;
                child.renderOrder = child.userData.renderOrder;
            });
        }
        this._selected = null;
        this._hovered = null;
        this._started = false;
        this._focused = null;
    }

    _onDocumentTouchStart(event) {
        event.preventDefault();
        event = event.changedTouches[0];

        const rect = this.domElement.getBoundingClientRect();

        this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this.camera);
        const intersects = this._raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            this._selected = intersects[0].object.parent;
            this._plane.setFromNormalAndCoplanarPoint(
                this.camera.getWorldDirection(this._plane.normal),
                this._selected.position
            );
            if (
                this._raycaster.ray.intersectPlane(
                    this._plane,
                    this._intersection
                )
            ) {
                this._offset
                    .copy(this._intersection)
                    .sub(this._selected.position);
            }
            this.domElement.style.cursor = "move";
        }
    }

    _onDocumentTouchMove(event) {
        event.preventDefault();
        event = event.changedTouches[0];

        const rect = this.domElement.getBoundingClientRect();

        this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this.camera);
        if (this._selected && this.enabled) {
            if (
                this._raycaster.ray.intersectPlane(
                    this._plane,
                    this._intersection
                )
            ) {
                this._selected.position.copy(
                    this._intersection.sub(this._offset)
                );
            }
            return;
        }
    }

    _onScroll(event) {
        event.preventDefault();
        if (!this._focused) return;
        const size = parseInt(event.deltaY);
        const sizeFactor = 0.001 * -size;
        if (size == 0) return;
        const maxFactor = !this._focused.userData.isFrame ? 3 : 10;
        const sizeFactorX = clamp(
            0.3,
            this._focused.scale.x + sizeFactor,
            maxFactor
        );
        const sizeFactorY = clamp(
            0.3,
            this._focused.scale.y + sizeFactor,
            maxFactor
        );
        this._focused.scale.x = sizeFactorX;
        this._focused.scale.y = sizeFactorY;
        if (!this._focused.matrixAutoUpdate) this._focused.updateMatrix();
    }

    _onDocumentTouchEnd(event) {
        event.preventDefault();

        if ((!this._hovered && !this._selected) || this._isPageDropped)
            this.domElement.style.cursor = "auto";
        else if (this._hovered && !this._selected)
            this.domElement.style.cursor = "pointer";
    }

    activate() {
        if (!this.domElement) {
            console.log(
                "Cannot activate the drag controls on a null DOM element"
            );
            return;
        }
        this.domElement.addEventListener(
            "mousedown",
            this.onDocumentMouseDown,
            false
        );
        this.domElement.addEventListener(
            "mousemove",
            this.onDocumentMouseMove,
            false
        );
        this.domElement.addEventListener(
            "mouseup",
            this.onDocumentMouseCancel,
            false
        );
        this.domElement.addEventListener(
            "touchstart",
            this.onDocumentTouchStart,
            false
        );
        this.domElement.addEventListener(
            "touchmove",
            this.onDocumentTouchMove,
            false
        );
        this.domElement.addEventListener(
            "touchend",
            this.onDocumentTouchEnd,
            false
        );
        this.domElement.addEventListener("wheel", this.onScroll, false);
    }
    deactivate() {
        this.eventBinded = false;
        if (!this.domElement) {
            console.log(
                "Cannot deactivate the drag controls on a null DOM element"
            );
            return;
        }
        this.domElement.removeEventListener(
            "mousedown",
            this.onDocumentMouseDown,
            false
        );
        this.domElement.removeEventListener(
            "mousemove",
            this.onDocumentMouseMove,
            false
        );
        this.domElement.removeEventListener(
            "mouseup",
            this.onDocumentMouseCancel,
            false
        );
        this.domElement.removeEventListener(
            "touchstart",
            this.onDocumentTouchStart,
            false
        );
        this.domElement.removeEventListener(
            "touchmove",
            this.onDocumentTouchMove,
            false
        );
        this.domElement.removeEventListener(
            "touchend",
            this.onDocumentTouchEnd,
            false
        );
        this.domElement.removeEventListener("wheel", this.onScroll, false);
    }
}
