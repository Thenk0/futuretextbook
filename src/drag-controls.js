import * as THREE from "three";
import { EventDispatcher } from "three";
import { clamp } from "./utilities";
let _plane = new THREE.Plane();
let _raycaster = new THREE.Raycaster();
let _mouse = new THREE.Vector2();
let _offset = new THREE.Vector3();
let _intersection = new THREE.Vector3();
let _selected = null;
let _hovered = null;
let scope;
let _started = false;
let _focused = null;
// Костыль, но я не могу разобраться по какой причине конструктор вызывается 2 раза.
let eventBinded = false;
export default class DragControls extends EventDispatcher {
    constructor(objects, camera, domElement) {
        super();
        this.objects = objects;
        this.enabled = true;
        this.camera = camera;
        this.domElement = domElement;
        scope = this;
        this.activate();
    }

    onDocumentMouseDown(event) {
        event.preventDefault();

        _raycaster.setFromCamera(_mouse, scope.camera);
        const intersects = _raycaster.intersectObjects(scope.objects);
        if (_started) {
            _focused = _selected;
            _started = false;
            _selected = null;
            scope.dispatchEvent({ type: "dragend", object: _selected });
            return;
        }
        if (intersects.length == 0) {
            return;
        }
        _started = true;
        _selected = intersects[0].object;
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
            _offset.copy(_intersection).sub(_selected.position);
        }
        scope.domElement.style.cursor = "move";
        scope.dispatchEvent({ type: "dragstart", object: _selected });
    }

    onDocumentMouseMove(event) {
        event.preventDefault();

        const rect = scope.domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, scope.camera);

        if (_selected && scope.enabled) {
            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                _selected.position.copy(_intersection.sub(_offset));
            }

            scope.dispatchEvent({ type: "drag", object: _selected });
            return;
        }

        _raycaster.setFromCamera(_mouse, scope.camera);

        const intersects = _raycaster.intersectObjects(scope.objects);
        if (intersects.length == 0) {
            if (_hovered !== null) {
                scope.dispatchEvent({ type: "hoverOff", object: _hovered });

                scope.domElement.style.cursor = "auto";
                _hovered = null;
            }
            return;
        }
        const object = intersects[0].object;
        _plane.setFromNormalAndCoplanarPoint(
            scope.camera.getWorldDirection(_plane.normal),
            object.position
        );

        if (_hovered !== object) {
            scope.dispatchEvent({ type: "hoverOn", object: object });

            scope.domElement.style.cursor = "pointer";
            _hovered = object;
        }

        if (_hovered !== null) {
            scope.dispatchEvent({ type: "hoverOff", object: _hovered });

            scope.domElement.style.cursor = "auto";
            _hovered = null;
        }
    }

    onDocumentMouseCancel(event) {
        event.preventDefault();
        // scope.domElement.style.cursor = "auto";
    }

    getFocused() {
        return _focused;
    }

    onDocumentTouchStart(event) {
        event.preventDefault();
        event = event.changedTouches[0];

        const rect = scope.domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, scope.camera);
        const intersects = _raycaster.intersectObjects(scope.objects);
        if (intersects.length > 0) {
            _selected = intersects[0].object;
            _plane.setFromNormalAndCoplanarPoint(
                scope.camera.getWorldDirection(_plane.normal),
                _selected.position
            );
            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                _offset.copy(_intersection).sub(_selected.position);
            }
            scope.domElement.style.cursor = "move";
            scope.dispatchEvent({ type: "dragstart", object: _selected });
        }
    }

    onDocumentTouchMove(event) {
        event.preventDefault();
        event = event.changedTouches[0];

        const rect = scope.domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, scope.camera);
        if (_selected && scope.enabled) {
            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                _selected.position.copy(_intersection.sub(_offset));
            }
            scope.dispatchEvent({ type: "drag", object: _selected });
            return;
        }
    }

    onScroll(event) {
        event.preventDefault();
        if (!_focused) return;
        const data = _focused.userData;
        const size = parseInt(event.deltaY);
        const sizeFactor = 0.001 * size;
        if (size == 0) return;
        const sizeFactorX = clamp(0.3, _focused.scale.x + sizeFactor, 3);
        const sizeFactorY = clamp(0.3, _focused.scale.y + sizeFactor, 3);
        _focused.scale.x = sizeFactorX;
        _focused.scale.y = sizeFactorY;

    }

    onDocumentTouchEnd(event) {
        event.preventDefault();

        if (_selected) {
            scope.dispatchEvent({ type: "dragend", object: _selected });
            _selected = null;
        }

        scope.domElement.style.cursor = "auto";
    }
    activate() {
        if (eventBinded) return;
        eventBinded = true;
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
