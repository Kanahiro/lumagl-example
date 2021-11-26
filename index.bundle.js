/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \**********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AnimationLoop)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");



const isPage = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.isBrowser)() && typeof document !== 'undefined';
let statIdCounter = 0;
class AnimationLoop {
  constructor(props = {}) {
    const {
      onCreateContext = opts => (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.createGLContext)(opts),
      onAddHTML = null,
      onInitialize = () => {},
      onRender = () => {},
      onFinalize = () => {},
      onError,
      gl = null,
      glOptions = {},
      debug = false,
      createFramebuffer = false,
      autoResizeViewport = true,
      autoResizeDrawingBuffer = true,
      stats = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.lumaStats.get(`animation-loop-${statIdCounter++}`)
    } = props;
    let {
      useDevicePixels = true
    } = props;

    if ('useDevicePixelRatio' in props) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('useDevicePixelRatio', 'useDevicePixels')();
      useDevicePixels = props.useDevicePixelRatio;
    }

    this.props = {
      onCreateContext,
      onAddHTML,
      onInitialize,
      onRender,
      onFinalize,
      onError,
      gl,
      glOptions,
      debug,
      createFramebuffer
    };
    this.gl = gl;
    this.needsRedraw = null;
    this.timeline = null;
    this.stats = stats;
    this.cpuTime = this.stats.get('CPU Time');
    this.gpuTime = this.stats.get('GPU Time');
    this.frameRate = this.stats.get('Frame Rate');
    this._initialized = false;
    this._running = false;
    this._animationFrameId = null;
    this._nextFramePromise = null;
    this._resolveNextFrame = null;
    this._cpuStartTime = 0;
    this.setProps({
      autoResizeViewport,
      autoResizeDrawingBuffer,
      useDevicePixels
    });
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this._pageLoadPromise = null;
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseleave = this._onMouseleave.bind(this);
  }

  delete() {
    this.stop();

    this._setDisplay(null);
  }

  setNeedsRedraw(reason) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__.assert)(typeof reason === 'string');
    this.needsRedraw = this.needsRedraw || reason;
    return this;
  }

  setProps(props) {
    if ('autoResizeViewport' in props) {
      this.autoResizeViewport = props.autoResizeViewport;
    }

    if ('autoResizeDrawingBuffer' in props) {
      this.autoResizeDrawingBuffer = props.autoResizeDrawingBuffer;
    }

    if ('useDevicePixels' in props) {
      this.useDevicePixels = props.useDevicePixels;
    }

    return this;
  }

  start(opts = {}) {
    if (this._running) {
      return this;
    }

    this._running = true;

    const startPromise = this._getPageLoadPromise().then(() => {
      if (!this._running || this._initialized) {
        return null;
      }

      this._createWebGLContext(opts);

      this._createFramebuffer();

      this._startEventHandling();

      this._initializeCallbackData();

      this._updateCallbackData();

      this._resizeCanvasDrawingBuffer();

      this._resizeViewport();

      this._gpuTimeQuery = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"].isSupported(this.gl, ['timers']) ? new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl) : null;
      this._initialized = true;
      return this.onInitialize(this.animationProps);
    }).then(appContext => {
      if (this._running) {
        this._addCallbackData(appContext || {});

        if (appContext !== false) {
          this._startLoop();
        }
      }
    });

    if (this.props.onError) {
      startPromise.catch(this.props.onError);
    }

    return this;
  }

  redraw() {
    if (this.isContextLost()) {
      return this;
    }

    this._beginTimers();

    this._setupFrame();

    this._updateCallbackData();

    this._renderFrame(this.animationProps);

    this._clearNeedsRedraw();

    if (this.offScreen && this.gl.commit) {
      this.gl.commit();
    }

    if (this._resolveNextFrame) {
      this._resolveNextFrame(this);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
    }

    this._endTimers();

    return this;
  }

  stop() {
    if (this._running) {
      this._finalizeCallbackData();

      this._cancelAnimationFrame(this._animationFrameId);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
      this._animationFrameId = null;
      this._running = false;
    }

    return this;
  }

  attachTimeline(timeline) {
    this.timeline = timeline;
    return this.timeline;
  }

  detachTimeline() {
    this.timeline = null;
  }

  waitForRender() {
    this.setNeedsRedraw('waitForRender');

    if (!this._nextFramePromise) {
      this._nextFramePromise = new Promise(resolve => {
        this._resolveNextFrame = resolve;
      });
    }

    return this._nextFramePromise;
  }

  async toDataURL() {
    this.setNeedsRedraw('toDataURL');
    await this.waitForRender();
    return this.gl.canvas.toDataURL();
  }

  isContextLost() {
    return this.gl.isContextLost();
  }

  onCreateContext(...args) {
    return this.props.onCreateContext(...args);
  }

  onInitialize(...args) {
    return this.props.onInitialize(...args);
  }

  onRender(...args) {
    return this.props.onRender(...args);
  }

  onFinalize(...args) {
    return this.props.onFinalize(...args);
  }

  getHTMLControlValue(id, defaultValue = 1) {
    const element = document.getElementById(id);
    return element ? Number(element.value) : defaultValue;
  }

  setViewParameters() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed('AnimationLoop.setViewParameters', 'AnimationLoop.setProps')();
    return this;
  }

  _startLoop() {
    const renderFrame = () => {
      if (!this._running) {
        return;
      }

      this.redraw();
      this._animationFrameId = this._requestAnimationFrame(renderFrame);
    };

    this._cancelAnimationFrame(this._animationFrameId);

    this._animationFrameId = this._requestAnimationFrame(renderFrame);
  }

  _getPageLoadPromise() {
    if (!this._pageLoadPromise) {
      this._pageLoadPromise = isPage ? new Promise((resolve, reject) => {
        if (isPage && document.readyState === 'complete') {
          resolve(document);
          return;
        }

        window.addEventListener('load', () => {
          resolve(document);
        });
      }) : Promise.resolve({});
    }

    return this._pageLoadPromise;
  }

  _setDisplay(display) {
    if (this.display) {
      this.display.delete();
      this.display.animationLoop = null;
    }

    if (display) {
      display.animationLoop = this;
    }

    this.display = display;
  }

  _cancelAnimationFrame(animationFrameId) {
    if (this.display && this.display.cancelAnimationFrame) {
      return this.display.cancelAnimationFrame(animationFrameId);
    }

    return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.cancelAnimationFrame)(animationFrameId);
  }

  _requestAnimationFrame(renderFrameCallback) {
    if (this._running) {
      if (this.display && this.display.requestAnimationFrame) {
        return this.display.requestAnimationFrame(renderFrameCallback);
      }

      return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.requestAnimationFrame)(renderFrameCallback);
    }

    return undefined;
  }

  _renderFrame(...args) {
    if (this.display) {
      this.display._renderFrame(...args);

      return;
    }

    this.onRender(...args);
  }

  _clearNeedsRedraw() {
    this.needsRedraw = null;
  }

  _setupFrame() {
    this._resizeCanvasDrawingBuffer();

    this._resizeViewport();

    this._resizeFramebuffer();
  }

  _initializeCallbackData() {
    this.animationProps = {
      gl: this.gl,
      stop: this.stop,
      canvas: this.gl.canvas,
      framebuffer: this.framebuffer,
      useDevicePixels: this.useDevicePixels,
      needsRedraw: null,
      startTime: Date.now(),
      engineTime: 0,
      tick: 0,
      tock: 0,
      time: 0,
      _timeline: this.timeline,
      _loop: this,
      _animationLoop: this,
      _mousePosition: null
    };
  }

  _updateCallbackData() {
    const {
      width,
      height,
      aspect
    } = this._getSizeAndAspect();

    if (width !== this.animationProps.width || height !== this.animationProps.height) {
      this.setNeedsRedraw('drawing buffer resized');
    }

    if (aspect !== this.animationProps.aspect) {
      this.setNeedsRedraw('drawing buffer aspect changed');
    }

    this.animationProps.width = width;
    this.animationProps.height = height;
    this.animationProps.aspect = aspect;
    this.animationProps.needsRedraw = this.needsRedraw;
    this.animationProps.engineTime = Date.now() - this.animationProps.startTime;

    if (this.timeline) {
      this.timeline.update(this.animationProps.engineTime);
    }

    this.animationProps.tick = Math.floor(this.animationProps.time / 1000 * 60);
    this.animationProps.tock++;
    this.animationProps.time = this.timeline ? this.timeline.getTime() : this.animationProps.engineTime;
    this.animationProps._offScreen = this.offScreen;
  }

  _finalizeCallbackData() {
    this.onFinalize(this.animationProps);
  }

  _addCallbackData(appContext) {
    if (typeof appContext === 'object' && appContext !== null) {
      this.animationProps = Object.assign({}, this.animationProps, appContext);
    }
  }

  _createWebGLContext(opts) {
    this.offScreen = opts.canvas && typeof OffscreenCanvas !== 'undefined' && opts.canvas instanceof OffscreenCanvas;
    opts = Object.assign({}, opts, this.props.glOptions);
    this.gl = this.props.gl ? (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.instrumentGLContext)(this.props.gl, opts) : this.onCreateContext(opts);

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(this.gl)) {
      throw new Error('AnimationLoop.onCreateContext - illegal context returned');
    }

    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resetParameters)(this.gl);

    this._createInfoDiv();
  }

  _createInfoDiv() {
    if (this.gl.canvas && this.props.onAddHTML) {
      const wrapperDiv = document.createElement('div');
      document.body.appendChild(wrapperDiv);
      wrapperDiv.style.position = 'relative';
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '10px';
      div.style.bottom = '10px';
      div.style.width = '300px';
      div.style.background = 'white';
      wrapperDiv.appendChild(this.gl.canvas);
      wrapperDiv.appendChild(div);
      const html = this.props.onAddHTML(div);

      if (html) {
        div.innerHTML = html;
      }
    }
  }

  _getSizeAndAspect() {
    const width = this.gl.drawingBufferWidth;
    const height = this.gl.drawingBufferHeight;
    let aspect = 1;
    const {
      canvas
    } = this.gl;

    if (canvas && canvas.clientHeight) {
      aspect = canvas.clientWidth / canvas.clientHeight;
    } else if (width > 0 && height > 0) {
      aspect = width / height;
    }

    return {
      width,
      height,
      aspect
    };
  }

  _resizeViewport() {
    if (this.autoResizeViewport) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }
  }

  _resizeCanvasDrawingBuffer() {
    if (this.autoResizeDrawingBuffer) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resizeGLContext)(this.gl, {
        useDevicePixels: this.useDevicePixels
      });
    }
  }

  _createFramebuffer() {
    if (this.props.createFramebuffer) {
      this.framebuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"](this.gl);
    }
  }

  _resizeFramebuffer() {
    if (this.framebuffer) {
      this.framebuffer.resize({
        width: this.gl.drawingBufferWidth,
        height: this.gl.drawingBufferHeight
      });
    }
  }

  _beginTimers() {
    this.frameRate.timeEnd();
    this.frameRate.timeStart();

    if (this._gpuTimeQuery && this._gpuTimeQuery.isResultAvailable() && !this._gpuTimeQuery.isTimerDisjoint()) {
      this.stats.get('GPU Time').addTime(this._gpuTimeQuery.getTimerMilliseconds());
    }

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.beginTimeElapsedQuery();
    }

    this.cpuTime.timeStart();
  }

  _endTimers() {
    this.cpuTime.timeEnd();

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.end();
    }
  }

  _startEventHandling() {
    const {
      canvas
    } = this.gl;

    if (canvas) {
      canvas.addEventListener('mousemove', this._onMousemove);
      canvas.addEventListener('mouseleave', this._onMouseleave);
    }
  }

  _onMousemove(e) {
    this.animationProps._mousePosition = [e.offsetX, e.offsetY];
  }

  _onMouseleave(e) {
    this.animationProps._mousePosition = null;
  }

}
//# sourceMappingURL=animation-loop.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBuffersFromGeometry": () => (/* binding */ getBuffersFromGeometry),
/* harmony export */   "inferAttributeAccessor": () => (/* binding */ inferAttributeAccessor)
/* harmony export */ });
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GLTF_TO_LUMA_ATTRIBUTE_MAP = {
  POSITION: 'positions',
  NORMAL: 'normals',
  COLOR_0: 'colors',
  TEXCOORD_0: 'texCoords',
  TEXCOORD_1: 'texCoords1',
  TEXCOORD_2: 'texCoords2'
};
function getBuffersFromGeometry(gl, geometry, options) {
  const buffers = {};
  let indices = geometry.indices;

  for (const name in geometry.attributes) {
    const attribute = geometry.attributes[name];
    const remappedName = mapAttributeName(name, options);

    if (name === 'indices') {
      indices = attribute;
    } else if (attribute.constant) {
      buffers[remappedName] = attribute.value;
    } else {
      const typedArray = attribute.value;
      const accessor = { ...attribute
      };
      delete accessor.value;
      buffers[remappedName] = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, typedArray), accessor];
      inferAttributeAccessor(name, accessor);
    }
  }

  if (indices) {
    const data = indices.value || indices;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(data instanceof Uint16Array || data instanceof Uint32Array, 'attribute array for "indices" must be of integer type');
    const accessor = {
      size: 1,
      isIndexed: indices.isIndexed === undefined ? true : indices.isIndexed
    };
    buffers.indices = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
      data,
      target: 34963
    }), accessor];
  }

  return buffers;
}

function mapAttributeName(name, options) {
  const {
    attributeMap = GLTF_TO_LUMA_ATTRIBUTE_MAP
  } = options || {};
  return attributeMap && attributeMap[name] || name;
}

function inferAttributeAccessor(attributeName, attribute) {
  let category;

  switch (attributeName) {
    case 'texCoords':
    case 'texCoord1':
    case 'texCoord2':
    case 'texCoord3':
      category = 'uvs';
      break;

    case 'vertices':
    case 'positions':
    case 'normals':
    case 'pickingColors':
      category = 'vectors';
      break;

    default:
  }

  switch (category) {
    case 'vectors':
      attribute.size = attribute.size || 3;
      break;

    case 'uvs':
      attribute.size = attribute.size || 2;
      break;

    default:
  }

  (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(Number.isFinite(attribute.size), `attribute ${attributeName} needs size`);
}
//# sourceMappingURL=model-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js":
/*!************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _program_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./program-manager */ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js");
/* harmony import */ var _model_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./model-utils */ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js");





const LOG_DRAW_PRIORITY = 2;
const LOG_DRAW_TIMEOUT = 10000;
const ERR_MODEL_PARAMS = 'Model needs drawMode and vertexCount';

const NOOP = () => {};

const DRAW_PARAMS = {};
class Model {
  constructor(gl, props = {}) {
    const {
      id = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('model')
    } = props;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(gl));
    this.id = id;
    this.gl = gl;
    this.id = props.id || (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('Model');
    this.lastLogTime = 0;
    this.animated = false;
    this.initialize(props);
  }

  initialize(props) {
    this.props = {};
    this.programManager = props.programManager || _program_manager__WEBPACK_IMPORTED_MODULE_3__["default"].getDefaultProgramManager(this.gl);
    this._programManagerState = -1;
    this._managedProgram = false;
    const {
      program = null,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this.program = null;
    this.vertexArray = null;
    this._programDirty = true;
    this.userData = {};
    this.needsRedraw = true;
    this._attributes = {};
    this.attributes = {};
    this.uniforms = {};
    this.pickable = true;

    this._checkProgram();

    this.setUniforms(Object.assign({}, this.getModuleUniforms(props.moduleSettings)));
    this.drawMode = props.drawMode !== undefined ? props.drawMode : 4;
    this.vertexCount = props.vertexCount || 0;
    this.geometryBuffers = {};
    this.isInstanced = props.isInstanced || props.instanced || props.instanceCount > 0;

    this._setModelProps(props);

    this.geometry = {};
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(this.drawMode !== undefined && Number.isFinite(this.vertexCount), ERR_MODEL_PARAMS);
  }

  setProps(props) {
    this._setModelProps(props);
  }

  delete() {
    for (const key in this._attributes) {
      if (this._attributes[key] !== this.attributes[key]) {
        this._attributes[key].delete();
      }
    }

    if (this._managedProgram) {
      this.programManager.release(this.program);
      this._managedProgram = false;
    }

    this.vertexArray.delete();

    this._deleteGeometryBuffers();
  }

  getDrawMode() {
    return this.drawMode;
  }

  getVertexCount() {
    return this.vertexCount;
  }

  getInstanceCount() {
    return this.instanceCount;
  }

  getAttributes() {
    return this.attributes;
  }

  getProgram() {
    return this.program;
  }

  setProgram(props) {
    const {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this._programDirty = true;
  }

  getUniforms() {
    return this.uniforms;
  }

  setDrawMode(drawMode) {
    this.drawMode = drawMode;
    return this;
  }

  setVertexCount(vertexCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(vertexCount));
    this.vertexCount = vertexCount;
    return this;
  }

  setInstanceCount(instanceCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(instanceCount));
    this.instanceCount = instanceCount;
    return this;
  }

  setGeometry(geometry) {
    this.drawMode = geometry.drawMode;
    this.vertexCount = geometry.getVertexCount();

    this._deleteGeometryBuffers();

    this.geometryBuffers = (0,_model_utils__WEBPACK_IMPORTED_MODULE_4__.getBuffersFromGeometry)(this.gl, geometry);
    this.vertexArray.setAttributes(this.geometryBuffers);
    return this;
  }

  setAttributes(attributes = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(attributes)) {
      return this;
    }

    const normalizedAttributes = {};

    for (const name in attributes) {
      const attribute = attributes[name];
      normalizedAttributes[name] = attribute.getValue ? attribute.getValue() : attribute;
    }

    this.vertexArray.setAttributes(normalizedAttributes);
    return this;
  }

  setUniforms(uniforms = {}) {
    Object.assign(this.uniforms, uniforms);
    return this;
  }

  getModuleUniforms(opts) {
    this._checkProgram();

    const getUniforms = this.programManager.getUniforms(this.program);

    if (getUniforms) {
      return getUniforms(opts);
    }

    return {};
  }

  updateModuleSettings(opts) {
    const uniforms = this.getModuleUniforms(opts || {});
    return this.setUniforms(uniforms);
  }

  clear(opts) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.clear)(this.program.gl, opts);
    return this;
  }

  draw(opts = {}) {
    this._checkProgram();

    const {
      moduleSettings = null,
      framebuffer,
      uniforms = {},
      attributes = {},
      transformFeedback = this.transformFeedback,
      parameters = {},
      vertexArray = this.vertexArray
    } = opts;
    this.setAttributes(attributes);
    this.updateModuleSettings(moduleSettings);
    this.setUniforms(uniforms);
    let logPriority;

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      logPriority = this._logDrawCallStart(LOG_DRAW_PRIORITY);
    }

    const drawParams = this.vertexArray.getDrawParams();
    const {
      isIndexed = drawParams.isIndexed,
      indexType = drawParams.indexType,
      indexOffset = drawParams.indexOffset,
      vertexArrayInstanced = drawParams.isInstanced
    } = this.props;

    if (vertexArrayInstanced && !this.isInstanced) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Found instanced attributes on non-instanced model', this.id)();
    }

    const {
      isInstanced,
      instanceCount
    } = this;
    const {
      onBeforeRender = NOOP,
      onAfterRender = NOOP
    } = this.props;
    onBeforeRender();
    this.program.setUniforms(this.uniforms);
    const didDraw = this.program.draw(Object.assign(DRAW_PARAMS, opts, {
      logPriority,
      uniforms: null,
      framebuffer,
      parameters,
      drawMode: this.getDrawMode(),
      vertexCount: this.getVertexCount(),
      vertexArray,
      transformFeedback,
      isIndexed,
      indexType,
      isInstanced,
      instanceCount,
      offset: isIndexed ? indexOffset : 0
    }));
    onAfterRender();

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      this._logDrawCallEnd(logPriority, vertexArray, framebuffer);
    }

    return didDraw;
  }

  transform(opts = {}) {
    const {
      discard = true,
      feedbackBuffers,
      unbindModels = []
    } = opts;
    let {
      parameters
    } = opts;

    if (feedbackBuffers) {
      this._setFeedbackBuffers(feedbackBuffers);
    }

    if (discard) {
      parameters = Object.assign({}, parameters, {
        [35977]: discard
      });
    }

    unbindModels.forEach(model => model.vertexArray.unbindBuffers());

    try {
      this.draw(Object.assign({}, opts, {
        parameters
      }));
    } finally {
      unbindModels.forEach(model => model.vertexArray.bindBuffers());
    }

    return this;
  }

  render(uniforms = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Model.render() is deprecated. Use Model.setUniforms() and Model.draw()')();
    return this.setUniforms(uniforms).draw();
  }

  _setModelProps(props) {
    Object.assign(this.props, props);

    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    if ('pickable' in props) {
      this.pickable = props.pickable;
    }

    if ('instanceCount' in props) {
      this.instanceCount = props.instanceCount;
    }

    if ('geometry' in props) {
      this.setGeometry(props.geometry);
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('_feedbackBuffers' in props) {
      this._setFeedbackBuffers(props._feedbackBuffers);
    }
  }

  _checkProgram() {
    const needsUpdate = this._programDirty || this.programManager.stateHash !== this._programManagerState;

    if (!needsUpdate) {
      return;
    }

    let {
      program
    } = this.programProps;

    if (program) {
      this._managedProgram = false;
    } else {
      const {
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      } = this.programProps;
      program = this.programManager.get({
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      });

      if (this.program && this._managedProgram) {
        this.programManager.release(this.program);
      }

      this._programManagerState = this.programManager.stateHash;
      this._managedProgram = true;
    }

    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(program instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"], 'Model needs a program');
    this._programDirty = false;

    if (program === this.program) {
      return;
    }

    this.program = program;

    if (this.vertexArray) {
      this.vertexArray.setProps({
        program: this.program,
        attributes: this.vertexArray.attributes
      });
    } else {
      this.vertexArray = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        program: this.program
      });
    }

    this.setUniforms(Object.assign({}, this.getModuleUniforms()));
  }

  _deleteGeometryBuffers() {
    for (const name in this.geometryBuffers) {
      const buffer = this.geometryBuffers[name][0] || this.geometryBuffers[name];

      if (buffer instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__["default"]) {
        buffer.delete();
      }
    }
  }

  _setAnimationProps(animationProps) {
    if (this.animated) {
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(animationProps, 'Model.draw(): animated uniforms but no animationProps');
    }
  }

  _setFeedbackBuffers(feedbackBuffers = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(feedbackBuffers)) {
      return this;
    }

    const {
      gl
    } = this.program;
    this.transformFeedback = this.transformFeedback || new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__["default"](gl, {
      program: this.program
    });
    this.transformFeedback.setBuffers(feedbackBuffers);
    return this;
  }

  _logDrawCallStart(logLevel) {
    const logDrawTimeout = logLevel > 3 ? 0 : LOG_DRAW_TIMEOUT;

    if (Date.now() - this.lastLogTime < logDrawTimeout) {
      return undefined;
    }

    this.lastLogTime = Date.now();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.group(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`, {
      collapsed: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level <= 2
    })();
    return logLevel;
  }

  _logDrawCallEnd(logLevel, vertexArray, uniforms, framebuffer) {
    if (logLevel === undefined) {
      return;
    }

    const attributeTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__.getDebugTableForVertexArray)({
      vertexArray,
      header: `${this.id} attributes`,
      attributes: this._attributes
    });
    const {
      table: uniformTable,
      unusedTable,
      unusedCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms)
    });
    const {
      table: missingTable,
      count: missingCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms),
      undefinedOnly: true
    });

    if (missingCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('MISSING UNIFORMS', Object.keys(missingTable))();
    }

    if (unusedCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('UNUSED UNIFORMS', Object.keys(unusedTable))();
    }

    const configTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__.getDebugTableForProgramConfiguration)(this.vertexArray.configuration);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, attributeTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, uniformTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel + 1, configTable)();

    if (framebuffer) {
      framebuffer.log({
        logLevel: LOG_DRAW_PRIORITY,
        message: `Rendered to ${framebuffer.id}`
      });
    }

    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.groupEnd(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`)();
  }

}
//# sourceMappingURL=model.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramManager)
/* harmony export */ });
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");


class ProgramManager {
  static getDefaultProgramManager(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultProgramManager = gl.luma.defaultProgramManager || new ProgramManager(gl);
    return gl.luma.defaultProgramManager;
  }

  constructor(gl) {
    this.gl = gl;
    this._programCache = {};
    this._getUniforms = {};
    this._registeredModules = {};
    this._hookFunctions = [];
    this._defaultModules = [];
    this._hashes = {};
    this._hashCounter = 0;
    this.stateHash = 0;
    this._useCounts = {};
  }

  addDefaultModule(module) {
    if (!this._defaultModules.find(m => m.name === module.name)) {
      this._defaultModules.push(module);
    }

    this.stateHash++;
  }

  removeDefaultModule(module) {
    const moduleName = typeof module === 'string' ? module : module.name;
    this._defaultModules = this._defaultModules.filter(m => m.name !== moduleName);
    this.stateHash++;
  }

  addShaderHook(hook, opts) {
    if (opts) {
      hook = Object.assign(opts, {
        hook
      });
    }

    this._hookFunctions.push(hook);

    this.stateHash++;
  }

  get(props = {}) {
    const {
      vs = '',
      fs = '',
      defines = {},
      inject = {},
      varyings = [],
      bufferMode = 0x8c8d,
      transpileToGLSL100 = false
    } = props;

    const modules = this._getModuleList(props.modules);

    const vsHash = this._getHash(vs);

    const fsHash = this._getHash(fs);

    const moduleHashes = modules.map(m => this._getHash(m.name)).sort();
    const varyingHashes = varyings.map(v => this._getHash(v));
    const defineKeys = Object.keys(defines).sort();
    const injectKeys = Object.keys(inject).sort();
    const defineHashes = [];
    const injectHashes = [];

    for (const key of defineKeys) {
      defineHashes.push(this._getHash(key));
      defineHashes.push(this._getHash(defines[key]));
    }

    for (const key of injectKeys) {
      injectHashes.push(this._getHash(key));
      injectHashes.push(this._getHash(inject[key]));
    }

    const hash = `${vsHash}/${fsHash}D${defineHashes.join('/')}M${moduleHashes.join('/')}I${injectHashes.join('/')}V${varyingHashes.join('/')}H${this.stateHash}B${bufferMode}${transpileToGLSL100 ? 'T' : ''}`;

    if (!this._programCache[hash]) {
      const assembled = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__.assembleShaders)(this.gl, {
        vs,
        fs,
        modules,
        inject,
        defines,
        hookFunctions: this._hookFunctions,
        transpileToGLSL100
      });
      this._programCache[hash] = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](this.gl, {
        hash,
        vs: assembled.vs,
        fs: assembled.fs,
        varyings,
        bufferMode
      });

      this._getUniforms[hash] = assembled.getUniforms || (x => {});

      this._useCounts[hash] = 0;
    }

    this._useCounts[hash]++;
    return this._programCache[hash];
  }

  getUniforms(program) {
    return this._getUniforms[program.hash] || null;
  }

  release(program) {
    const hash = program.hash;
    this._useCounts[hash]--;

    if (this._useCounts[hash] === 0) {
      this._programCache[hash].delete();

      delete this._programCache[hash];
      delete this._getUniforms[hash];
      delete this._useCounts[hash];
    }
  }

  _getHash(key) {
    if (this._hashes[key] === undefined) {
      this._hashes[key] = this._hashCounter++;
    }

    return this._hashes[key];
  }

  _getModuleList(appModules = []) {
    const modules = new Array(this._defaultModules.length + appModules.length);
    const seen = {};
    let count = 0;

    for (let i = 0, len = this._defaultModules.length; i < len; ++i) {
      const module = this._defaultModules[i];
      const name = module.name;
      modules[count++] = module;
      seen[name] = true;
    }

    for (let i = 0, len = appModules.length; i < len; ++i) {
      const module = appModules[i];
      const name = module.name;

      if (!seen[name]) {
        modules[count++] = module;
        seen[name] = true;
      }
    }

    modules.length = count;
    return modules;
  }

}
//# sourceMappingURL=program-manager.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/context/context.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGLContext": () => (/* binding */ createGLContext),
/* harmony export */   "instrumentGLContext": () => (/* binding */ instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* binding */ getContextDebugInfo),
/* harmony export */   "resizeGLContext": () => (/* binding */ resizeGLContext)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");






const isBrowser = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.isBrowser)();
const isPage = isBrowser && typeof document !== 'undefined';
const CONTEXT_DEFAULTS = {
  webgl2: true,
  webgl1: true,
  throwOnError: true,
  manageState: true,
  canvas: null,
  debug: false,
  width: 800,
  height: 600
};
function createGLContext(options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(isBrowser, "createGLContext only available in the browser.\nCreate your own headless context or use 'createHeadlessContext' from @luma.gl/test-utils");
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    width,
    height
  } = options;

  function onError(message) {
    if (options.throwOnError) {
      throw new Error(message);
    }

    console.error(message);
    return null;
  }

  options.onError = onError;
  let gl;
  const {
    canvas
  } = options;
  const targetCanvas = getCanvas({
    canvas,
    width,
    height,
    onError
  });
  gl = createBrowserContext(targetCanvas, options);

  if (!gl) {
    return null;
  }

  gl = instrumentGLContext(gl, options);
  logInfo(gl);
  return gl;
}
function instrumentGLContext(gl, options = {}) {
  if (!gl || gl._instrumented) {
    return gl;
  }

  gl._version = gl._version || getVersion(gl);
  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    manageState,
    debug
  } = options;

  if (manageState) {
    (0,_state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__.trackContextState)(gl, {
      copyState: false,
      log: (...args) => _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, ...args)()
    });
  }

  if (isBrowser && debug) {
    if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn('WebGL debug mode not activated. import "@luma.gl/debug" to enable.')();
    } else {
      gl = probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext(gl, options);
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level = Math.max(_utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level, 1);
    }
  }

  gl._instrumented = true;
  return gl;
}
function getContextDebugInfo(gl) {
  const vendorMasked = gl.getParameter(7936);
  const rendererMasked = gl.getParameter(7937);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || 7936);
  const rendererUnmasked = ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL || 7937);
  return {
    vendor: vendorUnmasked || vendorMasked,
    renderer: rendererUnmasked || rendererMasked,
    vendorMasked,
    rendererMasked,
    version: gl.getParameter(7938),
    shadingLanguageVersion: gl.getParameter(35724)
  };
}
function resizeGLContext(gl, options = {}) {
  if (gl.canvas) {
    const devicePixelRatio = (0,_utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__.getDevicePixelRatio)(options.useDevicePixels);
    setDevicePixelRatio(gl, devicePixelRatio, options);
    return;
  }

  const ext = gl.getExtension('STACKGL_resize_drawingbuffer');

  if (ext && `width` in options && `height` in options) {
    ext.resize(options.width, options.height);
  }
}

function createBrowserContext(canvas, options) {
  const {
    onError
  } = options;
  let errorMessage = null;

  const onCreateError = error => errorMessage = error.statusMessage || errorMessage;

  canvas.addEventListener('webglcontextcreationerror', onCreateError, false);
  const {
    webgl1 = true,
    webgl2 = true
  } = options;
  let gl = null;

  if (webgl2) {
    gl = gl || canvas.getContext('webgl2', options);
    gl = gl || canvas.getContext('experimental-webgl2', options);
  }

  if (webgl1) {
    gl = gl || canvas.getContext('webgl', options);
    gl = gl || canvas.getContext('experimental-webgl', options);
  }

  canvas.removeEventListener('webglcontextcreationerror', onCreateError, false);

  if (!gl) {
    return onError(`Failed to create ${webgl2 && !webgl1 ? 'WebGL2' : 'WebGL'} context: ${errorMessage || 'Unknown error'}`);
  }

  if (options.onContextLost) {
    canvas.addEventListener('webglcontextlost', options.onContextLost, false);
  }

  if (options.onContextRestored) {
    canvas.addEventListener('webglcontextrestored', options.onContextRestored, false);
  }

  return gl;
}

function getCanvas({
  canvas,
  width = 800,
  height = 600,
  onError
}) {
  let targetCanvas;

  if (typeof canvas === 'string') {
    const isPageLoaded = isPage && document.readyState === 'complete';

    if (!isPageLoaded) {
      onError(`createGLContext called on canvas '${canvas}' before page was loaded`);
    }

    targetCanvas = document.getElementById(canvas);
  } else if (canvas) {
    targetCanvas = canvas;
  } else {
    targetCanvas = document.createElement('canvas');
    targetCanvas.id = 'lumagl-canvas';
    targetCanvas.style.width = Number.isFinite(width) ? `${width}px` : '100%';
    targetCanvas.style.height = Number.isFinite(height) ? `${height}px` : '100%';
    document.body.insertBefore(targetCanvas, document.body.firstChild);
  }

  return targetCanvas;
}

function logInfo(gl) {
  const webGL = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__.isWebGL2)(gl) ? 'WebGL2' : 'WebGL1';
  const info = getContextDebugInfo(gl);
  const driver = info ? `(${info.vendor},${info.renderer})` : '';
  const debug = gl.debug ? ' debug' : '';
  _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.info(1, `${webGL}${debug} context ${driver}`)();
}

function getVersion(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return 2;
  }

  return 1;
}

function setDevicePixelRatio(gl, devicePixelRatio, options) {
  let clientWidth = 'width' in options ? options.width : gl.canvas.clientWidth;
  let clientHeight = 'height' in options ? options.height : gl.canvas.clientHeight;

  if (!clientWidth || !clientHeight) {
    _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, 'Canvas clientWidth/clientHeight is 0')();
    devicePixelRatio = 1;
    clientWidth = gl.canvas.width || 1;
    clientHeight = gl.canvas.height || 1;
  }

  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  const cachedSize = gl.luma.canvasSizeInfo;

  if (cachedSize.clientWidth !== clientWidth || cachedSize.clientHeight !== clientHeight || cachedSize.devicePixelRatio !== devicePixelRatio) {
    let clampedPixelRatio = devicePixelRatio;
    const canvasWidth = Math.floor(clientWidth * clampedPixelRatio);
    const canvasHeight = Math.floor(clientHeight * clampedPixelRatio);
    gl.canvas.width = canvasWidth;
    gl.canvas.height = canvasHeight;

    if (gl.drawingBufferWidth !== canvasWidth || gl.drawingBufferHeight !== canvasHeight) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn(`Device pixel ratio clamped`)();
      clampedPixelRatio = Math.min(gl.drawingBufferWidth / clientWidth, gl.drawingBufferHeight / clientHeight);
      gl.canvas.width = Math.floor(clientWidth * clampedPixelRatio);
      gl.canvas.height = Math.floor(clientHeight * clampedPixelRatio);
    }

    Object.assign(gl.luma.canvasSizeInfo, {
      clientWidth,
      clientHeight,
      devicePixelRatio
    });
  }
}
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* reexport safe */ _utils_log__WEBPACK_IMPORTED_MODULE_0__.log),
/* harmony export */   "isWebGL": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL),
/* harmony export */   "isWebGL2": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGL2Context),
/* harmony export */   "polyfillContext": () => (/* reexport safe */ _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__.polyfillContext),
/* harmony export */   "getParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.getParameters),
/* harmony export */   "setParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.setParameters),
/* harmony export */   "resetParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.resetParameters),
/* harmony export */   "withParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.withParameters),
/* harmony export */   "trackContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.trackContextState),
/* harmony export */   "pushContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.pushContextState),
/* harmony export */   "popContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.popContextState),
/* harmony export */   "createGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.createGLContext),
/* harmony export */   "resizeGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.resizeGLContext),
/* harmony export */   "instrumentGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.getContextDebugInfo),
/* harmony export */   "cssToDeviceRatio": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDevicePixels)
/* harmony export */ });
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill/polyfill-context */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js");
/* harmony import */ var _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./state-tracker/unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _context_context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./context/context */ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");







//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getParameterPolyfill": () => (/* binding */ getParameterPolyfill)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const OES_element_index = 'OES_element_index';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_disjoint_timer_query_webgl2 = 'EXT_disjoint_timer_query_webgl2';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const WEBGL_debug_renderer_info = 'WEBGL_debug_renderer_info';
const GL_FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8b8b;
const GL_DONT_CARE = 0x1100;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84ff;
const GL_UNMASKED_VENDOR_WEBGL = 0x9245;
const GL_UNMASKED_RENDERER_WEBGL = 0x9246;

const getWebGL2ValueOrZero = gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 0 : undefined;

const WEBGL_PARAMETERS = {
  [3074]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36064 : undefined,
  [GL_FRAGMENT_SHADER_DERIVATIVE_HINT]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? GL_DONT_CARE : undefined,
  [35977]: getWebGL2ValueOrZero,
  [32937]: getWebGL2ValueOrZero,
  [GL_GPU_DISJOINT_EXT]: (gl, getParameter) => {
    const ext = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? gl.getExtension(EXT_disjoint_timer_query_webgl2) : gl.getExtension(EXT_disjoint_timer_query);
    return ext && ext.GPU_DISJOINT_EXT ? getParameter(ext.GPU_DISJOINT_EXT) : 0;
  },
  [GL_UNMASKED_VENDOR_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_VENDOR_WEBGL || 7936);
  },
  [GL_UNMASKED_RENDERER_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_RENDERER_WEBGL || 7937);
  },
  [GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT]: (gl, getParameter) => {
    const ext = gl.luma.extensions[EXT_texture_filter_anisotropic];
    return ext ? getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1.0;
  },
  [32883]: getWebGL2ValueOrZero,
  [35071]: getWebGL2ValueOrZero,
  [37447]: getWebGL2ValueOrZero,
  [36063]: (gl, getParameter) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) : 0;
    }

    return undefined;
  },
  [35379]: getWebGL2ValueOrZero,
  [35374]: getWebGL2ValueOrZero,
  [35377]: getWebGL2ValueOrZero,
  [34852]: gl => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? ext.MAX_DRAW_BUFFERS_WEBGL : 0;
    }

    return undefined;
  },
  [36203]: gl => gl.getExtension(OES_element_index) ? 2147483647 : 65535,
  [33001]: gl => gl.getExtension(OES_element_index) ? 16777216 : 65535,
  [33000]: gl => 16777216,
  [37157]: getWebGL2ValueOrZero,
  [35373]: getWebGL2ValueOrZero,
  [35657]: getWebGL2ValueOrZero,
  [36183]: getWebGL2ValueOrZero,
  [37137]: getWebGL2ValueOrZero,
  [34045]: getWebGL2ValueOrZero,
  [35978]: getWebGL2ValueOrZero,
  [35979]: getWebGL2ValueOrZero,
  [35968]: getWebGL2ValueOrZero,
  [35376]: getWebGL2ValueOrZero,
  [35375]: getWebGL2ValueOrZero,
  [35659]: getWebGL2ValueOrZero,
  [37154]: getWebGL2ValueOrZero,
  [35371]: getWebGL2ValueOrZero,
  [35658]: getWebGL2ValueOrZero,
  [35076]: getWebGL2ValueOrZero,
  [35077]: getWebGL2ValueOrZero,
  [35380]: getWebGL2ValueOrZero
};
function getParameterPolyfill(gl, originalGetParameter, pname) {
  const limit = WEBGL_PARAMETERS[pname];
  const value = typeof limit === 'function' ? limit(gl, originalGetParameter, pname) : limit;
  const result = value !== undefined ? value : originalGetParameter(pname);
  return result;
}
//# sourceMappingURL=get-parameter-polyfill.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillContext": () => (/* binding */ polyfillContext)
/* harmony export */ });
/* harmony import */ var _polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfill-vertex-array-object */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _polyfill_table__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill-table */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js");



function polyfillContext(gl) {
  gl.luma = gl.luma || {};
  const {
    luma
  } = gl;

  if (!luma.polyfilled) {
    (0,_polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__.polyfillVertexArrayObject)(gl);
    initializeExtensions(gl);
    installPolyfills(gl, _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS);
    installOverrides(gl, {
      target: luma,
      target2: gl
    });
    luma.polyfilled = true;
  }

  return gl;
}
const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
global_.polyfillContext = polyfillContext;

function initializeExtensions(gl) {
  gl.luma.extensions = {};
  const EXTENSIONS = gl.getSupportedExtensions() || [];

  for (const extension of EXTENSIONS) {
    gl.luma[extension] = gl.getExtension(extension);
  }
}

function installOverrides(gl, {
  target,
  target2
}) {
  Object.keys(_polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES).forEach(key => {
    if (typeof _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key] === 'function') {
      const originalFunc = gl[key] ? gl[key].bind(gl) : () => {};
      const polyfill = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key].bind(null, gl, originalFunc);
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  });
}

function installPolyfills(gl, polyfills) {
  for (const extension of Object.getOwnPropertyNames(polyfills)) {
    if (extension !== 'overrides') {
      polyfillExtension(gl, {
        extension,
        target: gl.luma,
        target2: gl
      });
    }
  }
}

function polyfillExtension(gl, {
  extension,
  target,
  target2
}) {
  const defaults = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS[extension];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(defaults);
  const {
    meta = {}
  } = defaults;
  const {
    suffix = ''
  } = meta;
  const ext = gl.getExtension(extension);

  for (const key of Object.keys(defaults)) {
    const extKey = `${key}${suffix}`;
    let polyfill = null;

    if (key === 'meta') {} else if (typeof gl[key] === 'function') {} else if (ext && typeof ext[extKey] === 'function') {
      polyfill = (...args) => ext[extKey](...args);
    } else if (typeof defaults[key] === 'function') {
      polyfill = defaults[key].bind(target);
    }

    if (polyfill) {
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  }
}
//# sourceMappingURL=polyfill-context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WEBGL2_CONTEXT_POLYFILLS": () => (/* binding */ WEBGL2_CONTEXT_POLYFILLS),
/* harmony export */   "WEBGL2_CONTEXT_OVERRIDES": () => (/* binding */ WEBGL2_CONTEXT_OVERRIDES)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./get-parameter-polyfill */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js");



const OES_vertex_array_object = 'OES_vertex_array_object';
const ANGLE_instanced_arrays = 'ANGLE_instanced_arrays';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const ERR_VAO_NOT_SUPPORTED = 'VertexArray requires WebGL2 or OES_vertex_array_object extension';

function getExtensionData(gl, extension) {
  return {
    webgl2: (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl),
    ext: gl.getExtension(extension)
  };
}

const WEBGL2_CONTEXT_POLYFILLS = {
  [OES_vertex_array_object]: {
    meta: {
      suffix: 'OES'
    },
    createVertexArray: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false, ERR_VAO_NOT_SUPPORTED);
    },
    deleteVertexArray: () => {},
    bindVertexArray: () => {},
    isVertexArray: () => false
  },
  [ANGLE_instanced_arrays]: {
    meta: {
      suffix: 'ANGLE'
    },

    vertexAttribDivisor(location, divisor) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(divisor === 0, 'WebGL instanced rendering not supported');
    },

    drawElementsInstanced: () => {},
    drawArraysInstanced: () => {}
  },
  [WEBGL_draw_buffers]: {
    meta: {
      suffix: 'WEBGL'
    },
    drawBuffers: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    }
  },
  [EXT_disjoint_timer_query]: {
    meta: {
      suffix: 'EXT'
    },
    createQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    deleteQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    beginQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    endQuery: () => {},

    getQuery(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryParameter(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryObject: () => {}
  }
};
const WEBGL2_CONTEXT_OVERRIDES = {
  readBuffer: (gl, originalFunc, attachment) => {
    if ((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      originalFunc(attachment);
    } else {}
  },
  getVertexAttrib: (gl, originalFunc, location, pname) => {
    const {
      webgl2,
      ext
    } = getExtensionData(gl, ANGLE_instanced_arrays);
    let result;

    switch (pname) {
      case 35069:
        result = !webgl2 ? false : undefined;
        break;

      case 35070:
        result = !webgl2 && !ext ? 0 : undefined;
        break;

      default:
    }

    return result !== undefined ? result : originalFunc(location, pname);
  },
  getProgramParameter: (gl, originalFunc, program, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 35967:
          return 35981;

        case 35971:
          return 0;

        case 35382:
          return 0;

        default:
      }
    }

    return originalFunc(program, pname);
  },
  getInternalformatParameter: (gl, originalFunc, target, format, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 32937:
          return new Int32Array([0]);

        default:
      }
    }

    return gl.getInternalformatParameter(target, format, pname);
  },

  getTexParameter(gl, originalFunc, target, pname) {
    switch (pname) {
      case 34046:
        const {
          extensions
        } = gl.luma;
        const ext = extensions[EXT_texture_filter_anisotropic];
        pname = ext && ext.TEXTURE_MAX_ANISOTROPY_EXT || 34046;
        break;

      default:
    }

    return originalFunc(target, pname);
  },

  getParameter: _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__.getParameterPolyfill,

  hint(gl, originalFunc, pname, value) {
    return originalFunc(pname, value);
  }

};
//# sourceMappingURL=polyfill-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillVertexArrayObject": () => (/* binding */ polyfillVertexArrayObject)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");

const glErrorShadow = {};

function error(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error(msg);
  }
}

function log(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log(msg);
  }
}

function synthesizeGLError(err, opt_msg) {
  glErrorShadow[err] = true;

  if (opt_msg !== undefined) {
    error(opt_msg);
  }
}

function wrapGLError(gl) {
  const f = gl.getError;

  gl.getError = function getError() {
    let err;

    do {
      err = f.apply(gl);

      if (err !== 0) {
        glErrorShadow[err] = true;
      }
    } while (err !== 0);

    for (err in glErrorShadow) {
      if (glErrorShadow[err]) {
        delete glErrorShadow[err];
        return parseInt(err, 10);
      }
    }

    return 0;
  };
}

const WebGLVertexArrayObjectOES = function WebGLVertexArrayObjectOES(ext) {
  const gl = ext.gl;
  this.ext = ext;
  this.isAlive = true;
  this.hasBeenBound = false;
  this.elementArrayBuffer = null;
  this.attribs = new Array(ext.maxVertexAttribs);

  for (let n = 0; n < this.attribs.length; n++) {
    const attrib = new WebGLVertexArrayObjectOES.VertexAttrib(gl);
    this.attribs[n] = attrib;
  }

  this.maxAttrib = 0;
};

WebGLVertexArrayObjectOES.VertexAttrib = function VertexAttrib(gl) {
  this.enabled = false;
  this.buffer = null;
  this.size = 4;
  this.type = 5126;
  this.normalized = false;
  this.stride = 16;
  this.offset = 0;
  this.cached = '';
  this.recache();
};

WebGLVertexArrayObjectOES.VertexAttrib.prototype.recache = function recache() {
  this.cached = [this.size, this.type, this.normalized, this.stride, this.offset].join(':');
};

const OESVertexArrayObject = function OESVertexArrayObject(gl) {
  const self = this;
  this.gl = gl;
  wrapGLError(gl);
  const original = this.original = {
    getParameter: gl.getParameter,
    enableVertexAttribArray: gl.enableVertexAttribArray,
    disableVertexAttribArray: gl.disableVertexAttribArray,
    bindBuffer: gl.bindBuffer,
    getVertexAttrib: gl.getVertexAttrib,
    vertexAttribPointer: gl.vertexAttribPointer
  };

  gl.getParameter = function getParameter(pname) {
    if (pname === self.VERTEX_ARRAY_BINDING_OES) {
      if (self.currentVertexArrayObject === self.defaultVertexArrayObject) {
        return null;
      }

      return self.currentVertexArrayObject;
    }

    return original.getParameter.apply(this, arguments);
  };

  gl.enableVertexAttribArray = function enableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = true;
    return original.enableVertexAttribArray.apply(this, arguments);
  };

  gl.disableVertexAttribArray = function disableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = false;
    return original.disableVertexAttribArray.apply(this, arguments);
  };

  gl.bindBuffer = function bindBuffer(target, buffer) {
    switch (target) {
      case 34962:
        self.currentArrayBuffer = buffer;
        break;

      case 34963:
        self.currentVertexArrayObject.elementArrayBuffer = buffer;
        break;

      default:
    }

    return original.bindBuffer.apply(this, arguments);
  };

  gl.getVertexAttrib = function getVertexAttrib(index, pname) {
    const vao = self.currentVertexArrayObject;
    const attrib = vao.attribs[index];

    switch (pname) {
      case 34975:
        return attrib.buffer;

      case 34338:
        return attrib.enabled;

      case 34339:
        return attrib.size;

      case 34340:
        return attrib.stride;

      case 34341:
        return attrib.type;

      case 34922:
        return attrib.normalized;

      default:
        return original.getVertexAttrib.apply(this, arguments);
    }
  };

  gl.vertexAttribPointer = function vertexAttribPointer(indx, size, type, normalized, stride, offset) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, indx);
    const attrib = vao.attribs[indx];
    attrib.buffer = self.currentArrayBuffer;
    attrib.size = size;
    attrib.type = type;
    attrib.normalized = normalized;
    attrib.stride = stride;
    attrib.offset = offset;
    attrib.recache();
    return original.vertexAttribPointer.apply(this, arguments);
  };

  if (gl.instrumentExtension) {
    gl.instrumentExtension(this, 'OES_vertex_array_object');
  }

  if (gl.canvas) {
    gl.canvas.addEventListener('webglcontextrestored', () => {
      log('OESVertexArrayObject emulation library context restored');
      self.reset_();
    }, true);
  }

  this.reset_();
};

OESVertexArrayObject.prototype.VERTEX_ARRAY_BINDING_OES = 0x85b5;

OESVertexArrayObject.prototype.reset_ = function reset_() {
  const contextWasLost = this.vertexArrayObjects !== undefined;

  if (contextWasLost) {
    for (let ii = 0; ii < this.vertexArrayObjects.length; ++ii) {
      this.vertexArrayObjects.isAlive = false;
    }
  }

  const gl = this.gl;
  this.maxVertexAttribs = gl.getParameter(34921);
  this.defaultVertexArrayObject = new WebGLVertexArrayObjectOES(this);
  this.currentVertexArrayObject = null;
  this.currentArrayBuffer = null;
  this.vertexArrayObjects = [this.defaultVertexArrayObject];
  this.bindVertexArrayOES(null);
};

OESVertexArrayObject.prototype.createVertexArrayOES = function createVertexArrayOES() {
  const arrayObject = new WebGLVertexArrayObjectOES(this);
  this.vertexArrayObjects.push(arrayObject);
  return arrayObject;
};

OESVertexArrayObject.prototype.deleteVertexArrayOES = function deleteVertexArrayOES(arrayObject) {
  arrayObject.isAlive = false;
  this.vertexArrayObjects.splice(this.vertexArrayObjects.indexOf(arrayObject), 1);

  if (this.currentVertexArrayObject === arrayObject) {
    this.bindVertexArrayOES(null);
  }
};

OESVertexArrayObject.prototype.isVertexArrayOES = function isVertexArrayOES(arrayObject) {
  if (arrayObject && arrayObject instanceof WebGLVertexArrayObjectOES) {
    if (arrayObject.hasBeenBound && arrayObject.ext === this) {
      return true;
    }
  }

  return false;
};

OESVertexArrayObject.prototype.bindVertexArrayOES = function bindVertexArrayOES(arrayObject) {
  const gl = this.gl;

  if (arrayObject && !arrayObject.isAlive) {
    synthesizeGLError(1282, 'bindVertexArrayOES: attempt to bind deleted arrayObject');
    return;
  }

  const original = this.original;
  const oldVAO = this.currentVertexArrayObject;
  this.currentVertexArrayObject = arrayObject || this.defaultVertexArrayObject;
  this.currentVertexArrayObject.hasBeenBound = true;
  const newVAO = this.currentVertexArrayObject;

  if (oldVAO === newVAO) {
    return;
  }

  if (!oldVAO || newVAO.elementArrayBuffer !== oldVAO.elementArrayBuffer) {
    original.bindBuffer.call(gl, 34963, newVAO.elementArrayBuffer);
  }

  let currentBinding = this.currentArrayBuffer;
  const maxAttrib = Math.max(oldVAO ? oldVAO.maxAttrib : 0, newVAO.maxAttrib);

  for (let n = 0; n <= maxAttrib; n++) {
    const attrib = newVAO.attribs[n];
    const oldAttrib = oldVAO ? oldVAO.attribs[n] : null;

    if (!oldVAO || attrib.enabled !== oldAttrib.enabled) {
      if (attrib.enabled) {
        original.enableVertexAttribArray.call(gl, n);
      } else {
        original.disableVertexAttribArray.call(gl, n);
      }
    }

    if (attrib.enabled) {
      let bufferChanged = false;

      if (!oldVAO || attrib.buffer !== oldAttrib.buffer) {
        if (currentBinding !== attrib.buffer) {
          original.bindBuffer.call(gl, 34962, attrib.buffer);
          currentBinding = attrib.buffer;
        }

        bufferChanged = true;
      }

      if (bufferChanged || attrib.cached !== oldAttrib.cached) {
        original.vertexAttribPointer.call(gl, n, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
      }
    }
  }

  if (this.currentArrayBuffer !== currentBinding) {
    original.bindBuffer.call(gl, 34962, this.currentArrayBuffer);
  }
};

function polyfillVertexArrayObject(gl) {
  if (typeof gl.createVertexArray === 'function') {
    return;
  }

  const original_getSupportedExtensions = gl.getSupportedExtensions;

  gl.getSupportedExtensions = function getSupportedExtensions() {
    const list = original_getSupportedExtensions.call(this) || [];

    if (list.indexOf('OES_vertex_array_object') < 0) {
      list.push('OES_vertex_array_object');
    }

    return list;
  };

  const original_getExtension = gl.getExtension;

  gl.getExtension = function getExtension(name) {
    const ext = original_getExtension.call(this, name);

    if (ext) {
      return ext;
    }

    if (name !== 'OES_vertex_array_object') {
      return null;
    }

    if (!gl.__OESVertexArrayObject) {
      this.__OESVertexArrayObject = new OESVertexArrayObject(this);
    }

    return this.__OESVertexArrayObject;
  };
}
//# sourceMappingURL=polyfill-vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "trackContextState": () => (/* binding */ trackContextState),
/* harmony export */   "pushContextState": () => (/* binding */ pushContextState),
/* harmony export */   "popContextState": () => (/* binding */ popContextState)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function installGetterOverride(gl, functionName) {
  const originalGetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function get(...params) {
    const pname = params[0];

    if (!(pname in gl.state.cache)) {
      return originalGetterFunc(...params);
    }

    return gl.state.enable ? gl.state.cache[pname] : originalGetterFunc(...params);
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-from-cache`,
    configurable: false
  });
}

function installSetterSpy(gl, functionName, setter) {
  const originalSetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function set(...params) {
    const {
      valueChanged,
      oldValue
    } = setter(gl.state._updateCache, ...params);

    if (valueChanged) {
      originalSetterFunc(...params);
    }

    return oldValue;
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-to-cache`,
    configurable: false
  });
}

function installProgramSpy(gl) {
  const originalUseProgram = gl.useProgram.bind(gl);

  gl.useProgram = function useProgramLuma(handle) {
    if (gl.state.program !== handle) {
      originalUseProgram(handle);
      gl.state.program = handle;
    }
  };
}

class GLState {
  constructor(gl, {
    copyState = false,
    log = () => {}
  } = {}) {
    this.gl = gl;
    this.program = null;
    this.stateStack = [];
    this.enable = true;
    this.cache = copyState ? (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.getParameters)(gl) : Object.assign({}, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
    this.log = log;
    this._updateCache = this._updateCache.bind(this);
    Object.seal(this);
  }

  push(values = {}) {
    this.stateStack.push({});
  }

  pop() {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(this.stateStack.length > 0);
    const oldValues = this.stateStack[this.stateStack.length - 1];
    (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.setParameters)(this.gl, oldValues);
    this.stateStack.pop();
  }

  _updateCache(values) {
    let valueChanged = false;
    let oldValue;
    const oldValues = this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1];

    for (const key in values) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined);
      const value = values[key];
      const cached = this.cache[key];

      if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_3__.deepArrayEqual)(value, cached)) {
        valueChanged = true;
        oldValue = cached;

        if (oldValues && !(key in oldValues)) {
          oldValues[key] = cached;
        }

        this.cache[key] = value;
      }
    }

    return {
      valueChanged,
      oldValue
    };
  }

}

function trackContextState(gl, options = {}) {
  const {
    enable = true,
    copyState
  } = options;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(copyState !== undefined);

  if (!gl.state) {
    const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
    const {
      polyfillContext
    } = global_;

    if (polyfillContext) {
      polyfillContext(gl);
    }

    gl.state = new GLState(gl, {
      copyState
    });
    installProgramSpy(gl);

    for (const key in _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS) {
      const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS[key];
      installSetterSpy(gl, key, setter);
    }

    installGetterOverride(gl, 'getParameter');
    installGetterOverride(gl, 'isEnabled');
  }

  gl.state.enable = enable;
  return gl;
}
function pushContextState(gl) {
  if (!gl.state) {
    trackContextState(gl, {
      copyState: false
    });
  }

  gl.state.push();
}
function popContextState(gl) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(gl.state);
  gl.state.pop();
}
//# sourceMappingURL=track-context-state.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setParameters": () => (/* binding */ setParameters),
/* harmony export */   "getParameters": () => (/* binding */ getParameters),
/* harmony export */   "resetParameters": () => (/* binding */ resetParameters),
/* harmony export */   "withParameters": () => (/* binding */ withParameters)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _track_context_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function setParameters(gl, values) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__.isWebGL)(gl), 'setParameters requires a WebGL context');

  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(values)) {
    return;
  }

  const compositeSetters = {};

  for (const key in values) {
    const glConstant = Number(key);
    const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_SETTERS[key];

    if (setter) {
      if (typeof setter === 'string') {
        compositeSetters[setter] = true;
      } else {
        setter(gl, values[key], glConstant);
      }
    }
  }

  const cache = gl.state && gl.state.cache;

  if (cache) {
    for (const key in compositeSetters) {
      const compositeSetter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_COMPOSITE_PARAMETER_SETTERS[key];
      compositeSetter(gl, values, cache);
    }
  }
}
function getParameters(gl, parameters) {
  parameters = parameters || _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS;

  if (typeof parameters === 'number') {
    const key = parameters;
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    return getter ? getter(gl, key) : gl.getParameter(key);
  }

  const parameterKeys = Array.isArray(parameters) ? parameters : Object.keys(parameters);
  const state = {};

  for (const key of parameterKeys) {
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    state[key] = getter ? getter(gl, Number(key)) : gl.getParameter(Number(key));
  }

  return state;
}
function resetParameters(gl) {
  setParameters(gl, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
}
function withParameters(gl, parameters, func) {
  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(parameters)) {
    return func(gl);
  }

  const {
    nocatch = true
  } = parameters;
  (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.pushContextState)(gl);
  setParameters(gl, parameters);
  let value;

  if (nocatch) {
    value = func(gl);
    (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
  } else {
    try {
      value = func(gl);
    } finally {
      (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
    }
  }

  return value;
}
//# sourceMappingURL=unified-parameter-api.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GL_PARAMETER_DEFAULTS": () => (/* binding */ GL_PARAMETER_DEFAULTS),
/* harmony export */   "GL_PARAMETER_SETTERS": () => (/* binding */ GL_PARAMETER_SETTERS),
/* harmony export */   "GL_COMPOSITE_PARAMETER_SETTERS": () => (/* binding */ GL_COMPOSITE_PARAMETER_SETTERS),
/* harmony export */   "GL_HOOKED_SETTERS": () => (/* binding */ GL_HOOKED_SETTERS),
/* harmony export */   "GL_PARAMETER_GETTERS": () => (/* binding */ GL_PARAMETER_GETTERS)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const GL_PARAMETER_DEFAULTS = {
  [3042]: false,
  [32773]: new Float32Array([0, 0, 0, 0]),
  [32777]: 32774,
  [34877]: 32774,
  [32969]: 1,
  [32968]: 0,
  [32971]: 1,
  [32970]: 0,
  [3106]: new Float32Array([0, 0, 0, 0]),
  [3107]: [true, true, true, true],
  [2884]: false,
  [2885]: 1029,
  [2929]: false,
  [2931]: 1,
  [2932]: 513,
  [2928]: new Float32Array([0, 1]),
  [2930]: true,
  [3024]: true,
  [36006]: null,
  [2886]: 2305,
  [33170]: 4352,
  [2849]: 1,
  [32823]: false,
  [32824]: 0,
  [10752]: 0,
  [32938]: 1.0,
  [32939]: false,
  [3089]: false,
  [3088]: new Int32Array([0, 0, 1024, 1024]),
  [2960]: false,
  [2961]: 0,
  [2968]: 0xffffffff,
  [36005]: 0xffffffff,
  [2962]: 519,
  [2967]: 0,
  [2963]: 0xffffffff,
  [34816]: 519,
  [36003]: 0,
  [36004]: 0xffffffff,
  [2964]: 7680,
  [2965]: 7680,
  [2966]: 7680,
  [34817]: 7680,
  [34818]: 7680,
  [34819]: 7680,
  [2978]: [0, 0, 1024, 1024],
  [3333]: 4,
  [3317]: 4,
  [37440]: false,
  [37441]: false,
  [37443]: 37444,
  [35723]: 4352,
  [36010]: null,
  [35977]: false,
  [3330]: 0,
  [3332]: 0,
  [3331]: 0,
  [3314]: 0,
  [32878]: 0,
  [3316]: 0,
  [3315]: 0,
  [32877]: 0
};

const enable = (gl, value, key) => value ? gl.enable(key) : gl.disable(key);

const hint = (gl, value, key) => gl.hint(key, value);

const pixelStorei = (gl, value, key) => gl.pixelStorei(key, value);

const drawFramebuffer = (gl, value) => {
  const target = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36009 : 36160;
  return gl.bindFramebuffer(target, value);
};

const readFramebuffer = (gl, value) => {
  return gl.bindFramebuffer(36008, value);
};

function isArray(array) {
  return Array.isArray(array) || ArrayBuffer.isView(array);
}

const GL_PARAMETER_SETTERS = {
  [3042]: enable,
  [32773]: (gl, value) => gl.blendColor(...value),
  [32777]: 'blendEquation',
  [34877]: 'blendEquation',
  [32969]: 'blendFunc',
  [32968]: 'blendFunc',
  [32971]: 'blendFunc',
  [32970]: 'blendFunc',
  [3106]: (gl, value) => gl.clearColor(...value),
  [3107]: (gl, value) => gl.colorMask(...value),
  [2884]: enable,
  [2885]: (gl, value) => gl.cullFace(value),
  [2929]: enable,
  [2931]: (gl, value) => gl.clearDepth(value),
  [2932]: (gl, value) => gl.depthFunc(value),
  [2928]: (gl, value) => gl.depthRange(...value),
  [2930]: (gl, value) => gl.depthMask(value),
  [3024]: enable,
  [35723]: hint,
  [36006]: drawFramebuffer,
  [2886]: (gl, value) => gl.frontFace(value),
  [33170]: hint,
  [2849]: (gl, value) => gl.lineWidth(value),
  [32823]: enable,
  [32824]: 'polygonOffset',
  [10752]: 'polygonOffset',
  [35977]: enable,
  [32938]: 'sampleCoverage',
  [32939]: 'sampleCoverage',
  [3089]: enable,
  [3088]: (gl, value) => gl.scissor(...value),
  [2960]: enable,
  [2961]: (gl, value) => gl.clearStencil(value),
  [2968]: (gl, value) => gl.stencilMaskSeparate(1028, value),
  [36005]: (gl, value) => gl.stencilMaskSeparate(1029, value),
  [2962]: 'stencilFuncFront',
  [2967]: 'stencilFuncFront',
  [2963]: 'stencilFuncFront',
  [34816]: 'stencilFuncBack',
  [36003]: 'stencilFuncBack',
  [36004]: 'stencilFuncBack',
  [2964]: 'stencilOpFront',
  [2965]: 'stencilOpFront',
  [2966]: 'stencilOpFront',
  [34817]: 'stencilOpBack',
  [34818]: 'stencilOpBack',
  [34819]: 'stencilOpBack',
  [2978]: (gl, value) => gl.viewport(...value),
  [3333]: pixelStorei,
  [3317]: pixelStorei,
  [37440]: pixelStorei,
  [37441]: pixelStorei,
  [37443]: pixelStorei,
  [3330]: pixelStorei,
  [3332]: pixelStorei,
  [3331]: pixelStorei,
  [36010]: readFramebuffer,
  [3314]: pixelStorei,
  [32878]: pixelStorei,
  [3316]: pixelStorei,
  [3315]: pixelStorei,
  [32877]: pixelStorei,
  framebuffer: (gl, framebuffer) => {
    const handle = framebuffer && 'handle' in framebuffer ? framebuffer.handle : framebuffer;
    return gl.bindFramebuffer(36160, handle);
  },
  blend: (gl, value) => value ? gl.enable(3042) : gl.disable(3042),
  blendColor: (gl, value) => gl.blendColor(...value),
  blendEquation: (gl, args) => {
    args = isArray(args) ? args : [args, args];
    gl.blendEquationSeparate(...args);
  },
  blendFunc: (gl, args) => {
    args = isArray(args) && args.length === 2 ? [...args, ...args] : args;
    gl.blendFuncSeparate(...args);
  },
  clearColor: (gl, value) => gl.clearColor(...value),
  clearDepth: (gl, value) => gl.clearDepth(value),
  clearStencil: (gl, value) => gl.clearStencil(value),
  colorMask: (gl, value) => gl.colorMask(...value),
  cull: (gl, value) => value ? gl.enable(2884) : gl.disable(2884),
  cullFace: (gl, value) => gl.cullFace(value),
  depthTest: (gl, value) => value ? gl.enable(2929) : gl.disable(2929),
  depthFunc: (gl, value) => gl.depthFunc(value),
  depthMask: (gl, value) => gl.depthMask(value),
  depthRange: (gl, value) => gl.depthRange(...value),
  dither: (gl, value) => value ? gl.enable(3024) : gl.disable(3024),
  derivativeHint: (gl, value) => {
    gl.hint(35723, value);
  },
  frontFace: (gl, value) => gl.frontFace(value),
  mipmapHint: (gl, value) => gl.hint(33170, value),
  lineWidth: (gl, value) => gl.lineWidth(value),
  polygonOffsetFill: (gl, value) => value ? gl.enable(32823) : gl.disable(32823),
  polygonOffset: (gl, value) => gl.polygonOffset(...value),
  sampleCoverage: (gl, value) => gl.sampleCoverage(...value),
  scissorTest: (gl, value) => value ? gl.enable(3089) : gl.disable(3089),
  scissor: (gl, value) => gl.scissor(...value),
  stencilTest: (gl, value) => value ? gl.enable(2960) : gl.disable(2960),
  stencilMask: (gl, value) => {
    value = isArray(value) ? value : [value, value];
    const [mask, backMask] = value;
    gl.stencilMaskSeparate(1028, mask);
    gl.stencilMaskSeparate(1029, backMask);
  },
  stencilFunc: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [func, ref, mask, backFunc, backRef, backMask] = args;
    gl.stencilFuncSeparate(1028, func, ref, mask);
    gl.stencilFuncSeparate(1029, backFunc, backRef, backMask);
  },
  stencilOp: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [sfail, dpfail, dppass, backSfail, backDpfail, backDppass] = args;
    gl.stencilOpSeparate(1028, sfail, dpfail, dppass);
    gl.stencilOpSeparate(1029, backSfail, backDpfail, backDppass);
  },
  viewport: (gl, value) => gl.viewport(...value)
};

function getValue(glEnum, values, cache) {
  return values[glEnum] !== undefined ? values[glEnum] : cache[glEnum];
}

const GL_COMPOSITE_PARAMETER_SETTERS = {
  blendEquation: (gl, values, cache) => gl.blendEquationSeparate(getValue(32777, values, cache), getValue(34877, values, cache)),
  blendFunc: (gl, values, cache) => gl.blendFuncSeparate(getValue(32969, values, cache), getValue(32968, values, cache), getValue(32971, values, cache), getValue(32970, values, cache)),
  polygonOffset: (gl, values, cache) => gl.polygonOffset(getValue(32824, values, cache), getValue(10752, values, cache)),
  sampleCoverage: (gl, values, cache) => gl.sampleCoverage(getValue(32938, values, cache), getValue(32939, values, cache)),
  stencilFuncFront: (gl, values, cache) => gl.stencilFuncSeparate(1028, getValue(2962, values, cache), getValue(2967, values, cache), getValue(2963, values, cache)),
  stencilFuncBack: (gl, values, cache) => gl.stencilFuncSeparate(1029, getValue(34816, values, cache), getValue(36003, values, cache), getValue(36004, values, cache)),
  stencilOpFront: (gl, values, cache) => gl.stencilOpSeparate(1028, getValue(2964, values, cache), getValue(2965, values, cache), getValue(2966, values, cache)),
  stencilOpBack: (gl, values, cache) => gl.stencilOpSeparate(1029, getValue(34817, values, cache), getValue(34818, values, cache), getValue(34819, values, cache))
};
const GL_HOOKED_SETTERS = {
  enable: (update, capability) => update({
    [capability]: true
  }),
  disable: (update, capability) => update({
    [capability]: false
  }),
  pixelStorei: (update, pname, value) => update({
    [pname]: value
  }),
  hint: (update, pname, hint) => update({
    [pname]: hint
  }),
  bindFramebuffer: (update, target, framebuffer) => {
    switch (target) {
      case 36160:
        return update({
          [36006]: framebuffer,
          [36010]: framebuffer
        });

      case 36009:
        return update({
          [36006]: framebuffer
        });

      case 36008:
        return update({
          [36010]: framebuffer
        });

      default:
        return null;
    }
  },
  blendColor: (update, r, g, b, a) => update({
    [32773]: new Float32Array([r, g, b, a])
  }),
  blendEquation: (update, mode) => update({
    [32777]: mode,
    [34877]: mode
  }),
  blendEquationSeparate: (update, modeRGB, modeAlpha) => update({
    [32777]: modeRGB,
    [34877]: modeAlpha
  }),
  blendFunc: (update, src, dst) => update({
    [32969]: src,
    [32968]: dst,
    [32971]: src,
    [32970]: dst
  }),
  blendFuncSeparate: (update, srcRGB, dstRGB, srcAlpha, dstAlpha) => update({
    [32969]: srcRGB,
    [32968]: dstRGB,
    [32971]: srcAlpha,
    [32970]: dstAlpha
  }),
  clearColor: (update, r, g, b, a) => update({
    [3106]: new Float32Array([r, g, b, a])
  }),
  clearDepth: (update, depth) => update({
    [2931]: depth
  }),
  clearStencil: (update, s) => update({
    [2961]: s
  }),
  colorMask: (update, r, g, b, a) => update({
    [3107]: [r, g, b, a]
  }),
  cullFace: (update, mode) => update({
    [2885]: mode
  }),
  depthFunc: (update, func) => update({
    [2932]: func
  }),
  depthRange: (update, zNear, zFar) => update({
    [2928]: new Float32Array([zNear, zFar])
  }),
  depthMask: (update, mask) => update({
    [2930]: mask
  }),
  frontFace: (update, face) => update({
    [2886]: face
  }),
  lineWidth: (update, width) => update({
    [2849]: width
  }),
  polygonOffset: (update, factor, units) => update({
    [32824]: factor,
    [10752]: units
  }),
  sampleCoverage: (update, value, invert) => update({
    [32938]: value,
    [32939]: invert
  }),
  scissor: (update, x, y, width, height) => update({
    [3088]: new Int32Array([x, y, width, height])
  }),
  stencilMask: (update, mask) => update({
    [2968]: mask,
    [36005]: mask
  }),
  stencilMaskSeparate: (update, face, mask) => update({
    [face === 1028 ? 2968 : 36005]: mask
  }),
  stencilFunc: (update, func, ref, mask) => update({
    [2962]: func,
    [2967]: ref,
    [2963]: mask,
    [34816]: func,
    [36003]: ref,
    [36004]: mask
  }),
  stencilFuncSeparate: (update, face, func, ref, mask) => update({
    [face === 1028 ? 2962 : 34816]: func,
    [face === 1028 ? 2967 : 36003]: ref,
    [face === 1028 ? 2963 : 36004]: mask
  }),
  stencilOp: (update, fail, zfail, zpass) => update({
    [2964]: fail,
    [2965]: zfail,
    [2966]: zpass,
    [34817]: fail,
    [34818]: zfail,
    [34819]: zpass
  }),
  stencilOpSeparate: (update, face, fail, zfail, zpass) => update({
    [face === 1028 ? 2964 : 34817]: fail,
    [face === 1028 ? 2965 : 34818]: zfail,
    [face === 1028 ? 2966 : 34819]: zpass
  }),
  viewport: (update, x, y, width, height) => update({
    [2978]: [x, y, width, height]
  })
};

const isEnabled = (gl, key) => gl.isEnabled(key);

const GL_PARAMETER_GETTERS = {
  [3042]: isEnabled,
  [2884]: isEnabled,
  [2929]: isEnabled,
  [3024]: isEnabled,
  [32823]: isEnabled,
  [32926]: isEnabled,
  [32928]: isEnabled,
  [3089]: isEnabled,
  [2960]: isEnabled,
  [35977]: isEnabled
};
//# sourceMappingURL=webgl-parameter-tables.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cssToDeviceRatio": () => (/* binding */ cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* binding */ cssToDevicePixels),
/* harmony export */   "getDevicePixelRatio": () => (/* binding */ getDevicePixelRatio)
/* harmony export */ });
function cssToDeviceRatio(gl) {
  const {
    luma
  } = gl;

  if (gl.canvas && luma) {
    const {
      clientWidth
    } = luma.canvasSizeInfo;
    return clientWidth ? gl.drawingBufferWidth / clientWidth : 1;
  }

  return 1;
}
function cssToDevicePixels(gl, cssPixel, yInvert = true) {
  const ratio = cssToDeviceRatio(gl);
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  return scalePixels(cssPixel, ratio, width, height, yInvert);
}
function getDevicePixelRatio(useDevicePixels) {
  const windowRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  if (Number.isFinite(useDevicePixels)) {
    return useDevicePixels <= 0 ? 1 : useDevicePixels;
  }

  return useDevicePixels ? windowRatio : 1;
}

function scalePixels(pixel, ratio, width, height, yInvert) {
  const x = scaleX(pixel[0], ratio, width);
  let y = scaleY(pixel[1], ratio, height, yInvert);
  let t = scaleX(pixel[0] + 1, ratio, width);
  const xHigh = t === width - 1 ? t : t - 1;
  t = scaleY(pixel[1] + 1, ratio, height, yInvert);
  let yHigh;

  if (yInvert) {
    t = t === 0 ? t : t + 1;
    yHigh = y;
    y = t;
  } else {
    yHigh = t === height - 1 ? t : t - 1;
  }

  return {
    x,
    y,
    width: Math.max(xHigh - x + 1, 1),
    height: Math.max(yHigh - y + 1, 1)
  };
}

function scaleX(x, ratio, width) {
  const r = Math.min(Math.round(x * ratio), width - 1);
  return r;
}

function scaleY(y, ratio, height, yInvert) {
  return yInvert ? Math.max(0, height - 1 - Math.round(y * ratio)) : Math.min(Math.round(y * ratio), height - 1);
}
//# sourceMappingURL=device-pixels.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/log.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* binding */ log)
/* harmony export */ });
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/lib/log.js");

const log = new probe_gl__WEBPACK_IMPORTED_MODULE_0__["default"]({
  id: 'luma.gl'
});
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty),
/* harmony export */   "deepArrayEqual": () => (/* binding */ deepArrayEqual)
/* harmony export */ });
function isObjectEmpty(object) {
  for (const key in object) {
    return false;
  }

  return true;
}
function deepArrayEqual(x, y) {
  if (x === y) {
    return true;
  }

  const isArrayX = Array.isArray(x) || ArrayBuffer.isView(x);
  const isArrayY = Array.isArray(y) || ArrayBuffer.isView(y);

  if (isArrayX && isArrayY && x.length === y.length) {
    for (let i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERR_WEBGL": () => (/* binding */ ERR_WEBGL),
/* harmony export */   "ERR_WEBGL2": () => (/* binding */ ERR_WEBGL2),
/* harmony export */   "isWebGL": () => (/* binding */ isWebGL),
/* harmony export */   "isWebGL2": () => (/* binding */ isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* binding */ getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* binding */ assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* binding */ assertWebGL2Context)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");

const ERR_CONTEXT = 'Invalid WebGLRenderingContext';
const ERR_WEBGL = ERR_CONTEXT;
const ERR_WEBGL2 = 'Requires WebGL2';
function isWebGL(gl) {
  if (typeof WebGLRenderingContext !== 'undefined' && gl instanceof WebGLRenderingContext) {
    return true;
  }

  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && Number.isFinite(gl._version));
}
function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}
function getWebGL2Context(gl) {
  return isWebGL2(gl) ? gl : null;
}
function assertWebGLContext(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL(gl), ERR_CONTEXT);
  return gl;
}
function assertWebGL2Context(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL2(gl), ERR_WEBGL2);
  return gl;
}
//# sourceMappingURL=webgl-checks.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assembleShaders": () => (/* binding */ assembleShaders)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _resolve_modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-modules */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js");
/* harmony import */ var _platform_defines__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./platform-defines */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js");
/* harmony import */ var _inject_shader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./inject-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js");
/* harmony import */ var _transpile_shader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transpile-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");






const INJECT_SHADER_DECLARATIONS = `\n\n${_inject_shader__WEBPACK_IMPORTED_MODULE_0__.DECLARATION_INJECT_MARKER}\n\n`;
const SHADER_TYPE = {
  [_constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER]: 'vertex',
  [_constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER]: 'fragment'
};
const FRAGMENT_SHADER_PROLOGUE = `\
precision highp float;

`;
function assembleShaders(gl, opts) {
  const {
    vs,
    fs
  } = opts;
  const modules = (0,_resolve_modules__WEBPACK_IMPORTED_MODULE_2__.resolveModules)(opts.modules || []);
  return {
    gl,
    vs: assembleShader(gl, Object.assign({}, opts, {
      source: vs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER,
      modules
    })),
    fs: assembleShader(gl, Object.assign({}, opts, {
      source: fs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER,
      modules
    })),
    getUniforms: assembleGetUniforms(modules)
  };
}

function assembleShader(gl, {
  id,
  source,
  type,
  modules,
  defines = {},
  hookFunctions = [],
  inject = {},
  transpileToGLSL100 = false,
  prologue = true,
  log
}) {
  (0,_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(typeof source === 'string', 'shader source must be a string');
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER;
  const sourceLines = source.split('\n');
  let glslVersion = 100;
  let versionLine = '';
  let coreSource = source;

  if (sourceLines[0].indexOf('#version ') === 0) {
    glslVersion = 300;
    versionLine = sourceLines[0];
    coreSource = sourceLines.slice(1).join('\n');
  } else {
    versionLine = `#version ${glslVersion}`;
  }

  const allDefines = {};
  modules.forEach(module => {
    Object.assign(allDefines, module.getDefines());
  });
  Object.assign(allDefines, defines);
  let assembledSource = prologue ? `\
${versionLine}
${getShaderName({
    id,
    source,
    type
  })}
${getShaderType({
    type
  })}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getPlatformShaderDefines)(gl)}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getVersionDefines)(gl, glslVersion, !isVertex)}
${getApplicationDefines(allDefines)}
${isVertex ? '' : FRAGMENT_SHADER_PROLOGUE}
` : `${versionLine}
`;
  const hookFunctionMap = normalizeHookFunctions(hookFunctions);
  const hookInjections = {};
  const declInjections = {};
  const mainInjections = {};

  for (const key in inject) {
    const injection = typeof inject[key] === 'string' ? {
      injection: inject[key],
      order: 0
    } : inject[key];
    const match = key.match(/^(v|f)s:(#)?([\w-]+)$/);

    if (match) {
      const hash = match[2];
      const name = match[3];

      if (hash) {
        if (name === 'decl') {
          declInjections[key] = [injection];
        } else {
          mainInjections[key] = [injection];
        }
      } else {
        hookInjections[key] = [injection];
      }
    } else {
      mainInjections[key] = [injection];
    }
  }

  for (const module of modules) {
    if (log) {
      module.checkDeprecations(coreSource, log);
    }

    const moduleSource = module.getModuleSource(type, glslVersion);
    assembledSource += moduleSource;
    const injections = module.injections[type];

    for (const key in injections) {
      const match = key.match(/^(v|f)s:#([\w-]+)$/);

      if (match) {
        const name = match[2];
        const injectionType = name === 'decl' ? declInjections : mainInjections;
        injectionType[key] = injectionType[key] || [];
        injectionType[key].push(injections[key]);
      } else {
        hookInjections[key] = hookInjections[key] || [];
        hookInjections[key].push(injections[key]);
      }
    }
  }

  assembledSource += INJECT_SHADER_DECLARATIONS;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, declInjections);
  assembledSource += getHookFunctions(hookFunctionMap[type], hookInjections);
  assembledSource += coreSource;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, mainInjections);
  assembledSource = (0,_transpile_shader__WEBPACK_IMPORTED_MODULE_5__["default"])(assembledSource, transpileToGLSL100 ? 100 : glslVersion, isVertex);
  return assembledSource;
}

function assembleGetUniforms(modules) {
  return function getUniforms(opts) {
    const uniforms = {};

    for (const module of modules) {
      const moduleUniforms = module.getUniforms(opts, uniforms);
      Object.assign(uniforms, moduleUniforms);
    }

    return uniforms;
  };
}

function getShaderType({
  type
}) {
  return `
#define SHADER_TYPE_${SHADER_TYPE[type].toUpperCase()}
`;
}

function getShaderName({
  id,
  source,
  type
}) {
  const injectShaderName = id && typeof id === 'string' && source.indexOf('SHADER_NAME') === -1;
  return injectShaderName ? `
#define SHADER_NAME ${id}_${SHADER_TYPE[type]}

` : '';
}

function getApplicationDefines(defines = {}) {
  let count = 0;
  let sourceText = '';

  for (const define in defines) {
    if (count === 0) {
      sourceText += '\n// APPLICATION DEFINES\n';
    }

    count++;
    const value = defines[define];

    if (value || Number.isFinite(value)) {
      sourceText += `#define ${define.toUpperCase()} ${defines[define]}\n`;
    }
  }

  if (count === 0) {
    sourceText += '\n';
  }

  return sourceText;
}

function getHookFunctions(hookFunctions, hookInjections) {
  let result = '';

  for (const hookName in hookFunctions) {
    const hookFunction = hookFunctions[hookName];
    result += `void ${hookFunction.signature} {\n`;

    if (hookFunction.header) {
      result += `  ${hookFunction.header}`;
    }

    if (hookInjections[hookName]) {
      const injections = hookInjections[hookName];
      injections.sort((a, b) => a.order - b.order);

      for (const injection of injections) {
        result += `  ${injection.injection}\n`;
      }
    }

    if (hookFunction.footer) {
      result += `  ${hookFunction.footer}`;
    }

    result += '}\n';
  }

  return result;
}

function normalizeHookFunctions(hookFunctions) {
  const result = {
    vs: {},
    fs: {}
  };
  hookFunctions.forEach(hook => {
    let opts;

    if (typeof hook !== 'string') {
      opts = hook;
      hook = opts.hook;
    } else {
      opts = {};
    }

    hook = hook.trim();
    const [stage, signature] = hook.split(':');
    const name = hook.replace(/\(.+/, '');
    result[stage][name] = Object.assign(opts, {
      signature
    });
  });
  return result;
}
//# sourceMappingURL=assemble-shaders.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VERTEX_SHADER": () => (/* binding */ VERTEX_SHADER),
/* harmony export */   "FRAGMENT_SHADER": () => (/* binding */ FRAGMENT_SHADER)
/* harmony export */ });
const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parsePropTypes": () => (/* binding */ parsePropTypes)
/* harmony export */ });
const TYPE_DEFINITIONS = {
  number: {
    validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }

  },
  array: {
    validate(value, propType) {
      return Array.isArray(value) || ArrayBuffer.isView(value);
    }

  }
};
function parsePropTypes(propDefs) {
  const propTypes = {};

  for (const propName in propDefs) {
    const propDef = propDefs[propName];
    const propType = parsePropType(propDef);
    propTypes[propName] = propType;
  }

  return propTypes;
}

function parsePropType(propDef) {
  let type = getTypeOf(propDef);

  if (type === 'object') {
    if (!propDef) {
      return {
        type: 'object',
        value: null
      };
    }

    if ('type' in propDef) {
      return Object.assign({}, propDef, TYPE_DEFINITIONS[propDef.type]);
    }

    if (!('value' in propDef)) {
      return {
        type: 'object',
        value: propDef
      };
    }

    type = getTypeOf(propDef.value);
    return Object.assign({
      type
    }, propDef, TYPE_DEFINITIONS[type]);
  }

  return Object.assign({
    type,
    value: propDef
  }, TYPE_DEFINITIONS[type]);
}

function getTypeOf(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return 'array';
  }

  return typeof value;
}
//# sourceMappingURL=prop-types.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DECLARATION_INJECT_MARKER": () => (/* binding */ DECLARATION_INJECT_MARKER),
/* harmony export */   "default": () => (/* binding */ injectShader),
/* harmony export */   "combineInjects": () => (/* binding */ combineInjects)
/* harmony export */ });
/* harmony import */ var _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/module-injectors */ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");



const MODULE_INJECTORS = {
  [_constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_VS,
  [_constants__WEBPACK_IMPORTED_MODULE_0__.FRAGMENT_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_FS
};
const DECLARATION_INJECT_MARKER = '__LUMA_INJECT_DECLARATIONS__';
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
const REGEX_END_OF_MAIN = /}\n?[^{}]*$/;
const fragments = [];
function injectShader(source, type, inject, injectStandardStubs = false) {
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER;

  for (const key in inject) {
    const fragmentData = inject[key];
    fragmentData.sort((a, b) => a.order - b.order);
    fragments.length = fragmentData.length;

    for (let i = 0, len = fragmentData.length; i < len; ++i) {
      fragments[i] = fragmentData[i].injection;
    }

    const fragmentString = `${fragments.join('\n')}\n`;

    switch (key) {
      case 'vs:#decl':
        if (isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'vs:#main-start':
        if (isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'vs:#main-end':
        if (isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      case 'fs:#decl':
        if (!isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'fs:#main-start':
        if (!isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'fs:#main-end':
        if (!isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      default:
        source = source.replace(key, match => match + fragmentString);
    }
  }

  source = source.replace(DECLARATION_INJECT_MARKER, '');

  if (injectStandardStubs) {
    source = source.replace(/\}\s*$/, match => match + MODULE_INJECTORS[type]);
  }

  return source;
}
function combineInjects(injects) {
  const result = {};
  (0,_utils__WEBPACK_IMPORTED_MODULE_2__["default"])(Array.isArray(injects) && injects.length > 1);
  injects.forEach(inject => {
    for (const key in inject) {
      result[key] = result[key] ? `${result[key]}\n${inject[key]}` : inject[key];
    }
  });
  return result;
}
//# sourceMappingURL=inject-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPlatformShaderDefines": () => (/* binding */ getPlatformShaderDefines),
/* harmony export */   "getVersionDefines": () => (/* binding */ getVersionDefines)
/* harmony export */ });
/* harmony import */ var _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-info */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js");

function getPlatformShaderDefines(gl) {
  const debugInfo = (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.getContextInfo)(gl);

  switch (debugInfo.gpuVendor.toLowerCase()) {
    case 'nvidia':
      return `\
#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;

    case 'intel':
      return `\
#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;

    case 'amd':
      return `\
#define AMD_GPU
`;

    default:
      return `\
#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;
  }
}
function getVersionDefines(gl, glslVersion, isFragment) {
  let versionDefines = `\
#if (__VERSION__ > 120)

# define FEATURE_GLSL_DERIVATIVES
# define FEATURE_GLSL_DRAW_BUFFERS
# define FEATURE_GLSL_FRAG_DEPTH
# define FEATURE_GLSL_TEXTURE_LOD

// DEPRECATED FLAGS, remove in v9
# define FRAG_DEPTH
# define DERIVATIVES
# define DRAW_BUFFERS
# define TEXTURE_LOD

#endif // __VERSION
`;

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DEPTH)) {
    versionDefines += `\

// FRAG_DEPTH => gl_FragDepth is available
#ifdef GL_EXT_frag_depth
#extension GL_EXT_frag_depth : enable
# define FEATURE_GLSL_FRAG_DEPTH
# define FRAG_DEPTH
# define gl_FragDepth gl_FragDepthEXT
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES)) {
    versionDefines += `\

// DERIVATIVES => dxdF, dxdY and fwidth are available
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
# define FEATURE_GLSL_DERIVATIVES
# define DERIVATIVES
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA, {
    behavior: 'require'
  })) {
    versionDefines += `\

// DRAW_BUFFERS => gl_FragData[] is available
#ifdef GL_EXT_draw_buffers
#extension GL_EXT_draw_buffers : require
#define FEATURE_GLSL_DRAW_BUFFERS
#define DRAW_BUFFERS
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_TEXTURE_LOD)) {
    versionDefines += `\
// TEXTURE_LOD => texture2DLod etc are available
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable

# define FEATURE_GLSL_TEXTURE_LOD
# define TEXTURE_LOD

#endif
`;
  }

  return versionDefines;
}
//# sourceMappingURL=platform-defines.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resolveModules": () => (/* binding */ resolveModules),
/* harmony export */   "TEST_EXPORTS": () => (/* binding */ TEST_EXPORTS)
/* harmony export */ });
/* harmony import */ var _shader_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shader-module */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


function resolveModules(modules) {
  return getShaderDependencies(instantiateModules(modules));
}

function getShaderDependencies(modules) {
  const moduleMap = {};
  const moduleDepth = {};
  getDependencyGraph({
    modules,
    level: 0,
    moduleMap,
    moduleDepth
  });
  return Object.keys(moduleDepth).sort((a, b) => moduleDepth[b] - moduleDepth[a]).map(name => moduleMap[name]);
}

function getDependencyGraph({
  modules,
  level,
  moduleMap,
  moduleDepth
}) {
  if (level >= 5) {
    throw new Error('Possible loop in shader dependency graph');
  }

  for (const module of modules) {
    moduleMap[module.name] = module;

    if (moduleDepth[module.name] === undefined || moduleDepth[module.name] < level) {
      moduleDepth[module.name] = level;
    }
  }

  for (const module of modules) {
    if (module.dependencies) {
      getDependencyGraph({
        modules: module.dependencies,
        level: level + 1,
        moduleMap,
        moduleDepth
      });
    }
  }
}

function instantiateModules(modules, seen) {
  return modules.map(module => {
    if (module instanceof _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"]) {
      return module;
    }

    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(typeof module !== 'string', `Shader module use by name is deprecated. Import shader module '${module}' and use it directly.`);
    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(module.name, 'shader module has no name');
    module = new _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"](module);
    module.dependencies = instantiateModules(module.dependencies);
    return module;
  });
}

const TEST_EXPORTS = {
  getShaderDependencies,
  getDependencyGraph
};
//# sourceMappingURL=resolve-modules.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ShaderModule),
/* harmony export */   "normalizeShaderModule": () => (/* binding */ normalizeShaderModule)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");
/* harmony import */ var _filters_prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filters/prop-types */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js");


const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
class ShaderModule {
  constructor({
    name,
    vs,
    fs,
    dependencies = [],
    uniforms,
    getUniforms,
    deprecations = [],
    defines = {},
    inject = {},
    vertexShader,
    fragmentShader
  }) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(typeof name === 'string');
    this.name = name;
    this.vs = vs || vertexShader;
    this.fs = fs || fragmentShader;
    this.getModuleUniforms = getUniforms;
    this.dependencies = dependencies;
    this.deprecations = this._parseDeprecationDefinitions(deprecations);
    this.defines = defines;
    this.injections = normalizeInjections(inject);

    if (uniforms) {
      this.uniforms = (0,_filters_prop_types__WEBPACK_IMPORTED_MODULE_1__.parsePropTypes)(uniforms);
    }
  }

  getModuleSource(type) {
    let moduleSource;

    switch (type) {
      case VERTEX_SHADER:
        moduleSource = this.vs || '';
        break;

      case FRAGMENT_SHADER:
        moduleSource = this.fs || '';
        break;

      default:
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
    }

    return `\
#define MODULE_${this.name.toUpperCase().replace(/[^0-9a-z]/gi, '_')}
${moduleSource}\
// END MODULE_${this.name}

`;
  }

  getUniforms(opts, uniforms) {
    if (this.getModuleUniforms) {
      return this.getModuleUniforms(opts, uniforms);
    }

    if (this.uniforms) {
      return this._defaultGetUniforms(opts);
    }

    return {};
  }

  getDefines() {
    return this.defines;
  }

  checkDeprecations(shaderSource, log) {
    this.deprecations.forEach(def => {
      if (def.regex.test(shaderSource)) {
        if (def.deprecated) {
          log.deprecated(def.old, def.new)();
        } else {
          log.removed(def.old, def.new)();
        }
      }
    });
  }

  _parseDeprecationDefinitions(deprecations) {
    deprecations.forEach(def => {
      switch (def.type) {
        case 'function':
          def.regex = new RegExp(`\\b${def.old}\\(`);
          break;

        default:
          def.regex = new RegExp(`${def.type} ${def.old};`);
      }
    });
    return deprecations;
  }

  _defaultGetUniforms(opts = {}) {
    const uniforms = {};
    const propTypes = this.uniforms;

    for (const key in propTypes) {
      const propDef = propTypes[key];

      if (key in opts && !propDef.private) {
        if (propDef.validate) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(propDef.validate(opts[key], propDef), `${this.name}: invalid ${key}`);
        }

        uniforms[key] = opts[key];
      } else {
        uniforms[key] = propDef.value;
      }
    }

    return uniforms;
  }

}
function normalizeShaderModule(module) {
  if (!module.normalized) {
    module.normalized = true;

    if (module.uniforms && !module.getUniforms) {
      const shaderModule = new ShaderModule(module);
      module.getUniforms = shaderModule.getUniforms.bind(shaderModule);
    }
  }

  return module;
}

function normalizeInjections(injections) {
  const result = {
    vs: {},
    fs: {}
  };

  for (const hook in injections) {
    let injection = injections[hook];
    const stage = hook.slice(0, 2);

    if (typeof injection === 'string') {
      injection = {
        order: 0,
        injection
      };
    }

    result[stage][hook] = injection;
  }

  return result;
}
//# sourceMappingURL=shader-module.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ transpileShader)
/* harmony export */ });
function testVariable(qualifier) {
  return new RegExp(`\\b${qualifier}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`, 'g');
}

const ES300_REPLACEMENTS = [[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/, '#version 300 es\n'], [/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g, 'textureLod('], [/\btexture(2D|2DProj|Cube)(EXT)?\(/g, 'texture(']];
const ES300_VERTEX_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('attribute'), 'in $1'], [testVariable('varying'), 'out $1']];
const ES300_FRAGMENT_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('varying'), 'in $1']];
const ES100_REPLACEMENTS = [[/^#version[ \t]+300[ \t]+es/, '#version 100'], [/\btexture(2D|2DProj|Cube)Lod\(/g, 'texture$1LodEXT('], [/\btexture\(/g, 'texture2D('], [/\btextureLod\(/g, 'texture2DLodEXT(']];
const ES100_VERTEX_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'attribute $1'], [testVariable('out'), 'varying $1']];
const ES100_FRAGMENT_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'varying $1']];
const ES100_FRAGMENT_OUTPUT_NAME = 'gl_FragColor';
const ES300_FRAGMENT_OUTPUT_REGEX = /\bout[ \t]+vec4[ \t]+(\w+)[ \t]*;\n?/;
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
function transpileShader(source, targetGLSLVersion, isVertex) {
  switch (targetGLSLVersion) {
    case 300:
      return isVertex ? convertShader(source, ES300_VERTEX_REPLACEMENTS) : convertFragmentShaderTo300(source);

    case 100:
      return isVertex ? convertShader(source, ES100_VERTEX_REPLACEMENTS) : convertFragmentShaderTo100(source);

    default:
      throw new Error(`unknown GLSL version ${targetGLSLVersion}`);
  }
}

function convertShader(source, replacements) {
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }

  return source;
}

function convertFragmentShaderTo300(source) {
  source = convertShader(source, ES300_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  } else {
    const outputName = 'fragmentColor';
    source = source.replace(REGEX_START_OF_MAIN, match => `out vec4 ${outputName};\n${match}`).replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  }

  return source;
}

function convertFragmentShaderTo100(source) {
  source = convertShader(source, ES100_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(ES300_FRAGMENT_OUTPUT_REGEX, '').replace(new RegExp(`\\b${outputName}\\b`, 'g'), ES100_FRAGMENT_OUTPUT_NAME);
  }

  return source;
}
//# sourceMappingURL=transpile-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MODULE_INJECTORS_VS": () => (/* binding */ MODULE_INJECTORS_VS),
/* harmony export */   "MODULE_INJECTORS_FS": () => (/* binding */ MODULE_INJECTORS_FS)
/* harmony export */ });
const MODULE_INJECTORS_VS = `\
#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`;
const MODULE_INJECTORS_FS = `\
#ifdef MODULE_MATERIAL
  gl_FragColor = material_filterColor(gl_FragColor);
#endif

#ifdef MODULE_LIGHTING
  gl_FragColor = lighting_filterColor(gl_FragColor);
#endif

#ifdef MODULE_FOG
  gl_FragColor = fog_filterColor(gl_FragColor);
#endif

#ifdef MODULE_PICKING
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`;
//# sourceMappingURL=module-injectors.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'shadertools: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isOldIE)
/* harmony export */ });
function isOldIE(opts = {}) {
  const navigator = typeof window !== 'undefined' ? window.navigator || {} : {};
  const userAgent = opts.userAgent || navigator.userAgent || '';
  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;
  return isMSIE || isTrident;
}
//# sourceMappingURL=is-old-ie.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "getContextInfo": () => (/* binding */ getContextInfo),
/* harmony export */   "canCompileGLGSExtension": () => (/* binding */ canCompileGLGSExtension),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures)
/* harmony export */ });
/* harmony import */ var _is_old_ie__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-old-ie */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js");
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


const GL_VENDOR = 0x1f00;
const GL_RENDERER = 0x1f01;
const GL_VERSION = 0x1f02;
const GL_SHADING_LANGUAGE_VERSION = 0x8b8c;
const WEBGL_FEATURES = {
  GLSL_FRAG_DATA: ['WEBGL_draw_buffers', true],
  GLSL_FRAG_DEPTH: ['EXT_frag_depth', true],
  GLSL_DERIVATIVES: ['OES_standard_derivatives', true],
  GLSL_TEXTURE_LOD: ['EXT_shader_texture_lod', true]
};
const FEATURES = {};
Object.keys(WEBGL_FEATURES).forEach(key => {
  FEATURES[key] = key;
});


function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}

function getContextInfo(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter(info && info.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
  const renderer = gl.getParameter(info && info.UNMASKED_RENDERER_WEBGL || GL_RENDERER);
  const gpuVendor = identifyGPUVendor(vendor, renderer);
  const gpuInfo = {
    gpuVendor,
    vendor,
    renderer,
    version: gl.getParameter(GL_VERSION),
    shadingLanguageVersion: gl.getParameter(GL_SHADING_LANGUAGE_VERSION)
  };
  return gpuInfo;
}

function identifyGPUVendor(vendor, renderer) {
  if (vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i)) {
    return 'NVIDIA';
  }

  if (vendor.match(/INTEL/i) || renderer.match(/INTEL/i)) {
    return 'INTEL';
  }

  if (vendor.match(/AMD/i) || renderer.match(/AMD/i) || vendor.match(/ATI/i) || renderer.match(/ATI/i)) {
    return 'AMD';
  }

  return 'UNKNOWN GPU';
}

const compiledGlslExtensions = {};
function canCompileGLGSExtension(gl, cap, opts = {}) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);

  if (!(0,_is_old_ie__WEBPACK_IMPORTED_MODULE_1__["default"])(opts)) {
    return true;
  }

  if (cap in compiledGlslExtensions) {
    return compiledGlslExtensions[cap];
  }

  const extensionName = feature[0];
  const behavior = opts.behavior || 'enable';
  const source = `#extension GL_${extensionName} : ${behavior}\nvoid main(void) {}`;
  const shader = gl.createShader(35633);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const canCompile = gl.getShaderParameter(shader, 35713);
  gl.deleteShader(shader);
  compiledGlslExtensions[cap] = canCompile;
  return canCompile;
}

function getFeature(gl, cap) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);
  const extensionName = isWebGL2(gl) ? feature[1] || feature[0] : feature[0];
  const value = typeof extensionName === 'string' ? Boolean(gl.getExtension(extensionName)) : extensionName;
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(value === false || value === true);
  return value;
}

function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => getFeature(gl, feature));
}
//# sourceMappingURL=webgl-info.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Accessor),
/* harmony export */   "DEFAULT_ACCESSOR_VALUES": () => (/* binding */ DEFAULT_ACCESSOR_VALUES)
/* harmony export */ });
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");



const DEFAULT_ACCESSOR_VALUES = {
  offset: 0,
  stride: 0,
  type: 5126,
  size: 1,
  divisor: 0,
  normalized: false,
  integer: false
};
const PROP_CHECKS = {
  deprecatedProps: {
    instanced: 'divisor',
    isInstanced: 'divisor'
  }
};
class Accessor {
  static getBytesPerElement(accessor) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT;
  }

  static getBytesPerVertex(accessor) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(accessor.size);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT * accessor.size;
  }

  static resolve(...accessors) {
    return new Accessor(...[DEFAULT_ACCESSOR_VALUES, ...accessors]);
  }

  constructor(...accessors) {
    accessors.forEach(accessor => this._assign(accessor));
    Object.freeze(this);
  }

  toString() {
    return JSON.stringify(this);
  }

  get BYTES_PER_ELEMENT() {
    return Accessor.getBytesPerElement(this);
  }

  get BYTES_PER_VERTEX() {
    return Accessor.getBytesPerVertex(this);
  }

  _assign(props = {}) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_2__.checkProps)('Accessor', props, PROP_CHECKS);

    if (props.type !== undefined) {
      this.type = props.type;

      if (props.type === 5124 || props.type === 5125) {
        this.integer = true;
      }
    }

    if (props.size !== undefined) {
      this.size = props.size;
    }

    if (props.offset !== undefined) {
      this.offset = props.offset;
    }

    if (props.stride !== undefined) {
      this.stride = props.stride;
    }

    if (props.normalized !== undefined) {
      this.normalized = props.normalized;
    }

    if (props.integer !== undefined) {
      this.integer = props.integer;
    }

    if (props.divisor !== undefined) {
      this.divisor = props.divisor;
    }

    if (props.buffer !== undefined) {
      this.buffer = props.buffer;
    }

    if (props.index !== undefined) {
      if (typeof props.index === 'boolean') {
        this.index = props.index ? 1 : 0;
      } else {
        this.index = props.index;
      }
    }

    if (props.instanced !== undefined) {
      this.divisor = props.instanced ? 1 : 0;
    }

    if (props.isInstanced !== undefined) {
      this.divisor = props.isInstanced ? 1 : 0;
    }

    return this;
  }

}

//# sourceMappingURL=accessor.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Buffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");






const DEBUG_DATA_LENGTH = 10;
const DEPRECATED_PROPS = {
  offset: 'accessor.offset',
  stride: 'accessor.stride',
  type: 'accessor.type',
  size: 'accessor.size',
  divisor: 'accessor.divisor',
  normalized: 'accessor.normalized',
  integer: 'accessor.integer',
  instanced: 'accessor.divisor',
  isInstanced: 'accessor.divisor'
};
const PROP_CHECKS_INITIALIZE = {
  removedProps: {},
  replacedProps: {
    bytes: 'byteLength'
  },
  deprecatedProps: DEPRECATED_PROPS
};
const PROP_CHECKS_SET_PROPS = {
  removedProps: DEPRECATED_PROPS
};
class Buffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Buffer', 'v6.0', ['layout', 'setLayout', 'getIndexedParameter']);
    this.target = props.target || (this.gl.webgl2 ? 36662 : 34962);
    this.initialize(props);
    Object.seal(this);
  }

  getElementCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerElement(accessor));
  }

  getVertexCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerVertex(accessor));
  }

  initialize(props = {}) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    if (Number.isFinite(props)) {
      props = {
        byteLength: props
      };
    }

    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_INITIALIZE);
    this.usage = props.usage || 35044;
    this.debugData = null;
    this.setAccessor(Object.assign({}, props, props.accessor));

    if (props.data) {
      this._setData(props.data, props.offset, props.byteLength);
    } else {
      this._setByteLength(props.byteLength || 0);
    }

    return this;
  }

  setProps(props) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_SET_PROPS);

    if ('accessor' in props) {
      this.setAccessor(props.accessor);
    }

    return this;
  }

  setAccessor(accessor) {
    accessor = Object.assign({}, accessor);
    delete accessor.buffer;
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor);
    return this;
  }

  reallocate(byteLength) {
    if (byteLength > this.byteLength) {
      this._setByteLength(byteLength);

      return true;
    }

    this.bytesUsed = byteLength;
    return false;
  }

  setData(props) {
    return this.initialize(props);
  }

  subData(props) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    const {
      data,
      offset = 0,
      srcOffset = 0
    } = props;
    const byteLength = props.byteLength || props.length;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(data);
    const target = this.gl.webgl2 ? 36663 : this.target;
    this.gl.bindBuffer(target, this.handle);

    if (srcOffset !== 0 || byteLength !== undefined) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.gl.bufferSubData(this.target, offset, data, srcOffset, byteLength);
    } else {
      this.gl.bufferSubData(target, offset, data);
    }

    this.gl.bindBuffer(target, null);
    this.debugData = null;

    this._inferType(data);

    return this;
  }

  copyData({
    sourceBuffer,
    readOffset = 0,
    writeOffset = 0,
    size
  }) {
    const {
      gl
    } = this;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    gl.bindBuffer(36662, sourceBuffer.handle);
    gl.bindBuffer(36663, this.handle);
    gl.copyBufferSubData(36662, 36663, readOffset, writeOffset, size);
    gl.bindBuffer(36662, null);
    gl.bindBuffer(36663, null);
    this.debugData = null;
    return this;
  }

  getData({
    dstData = null,
    srcByteOffset = 0,
    dstOffset = 0,
    length = 0
  } = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });

    const sourceAvailableElementCount = this._getAvailableElementCount(srcByteOffset);

    const dstElementOffset = dstOffset;
    let dstAvailableElementCount;
    let dstElementCount;

    if (dstData) {
      dstElementCount = dstData.length;
      dstAvailableElementCount = dstElementCount - dstElementOffset;
    } else {
      dstAvailableElementCount = Math.min(sourceAvailableElementCount, length || sourceAvailableElementCount);
      dstElementCount = dstElementOffset + dstAvailableElementCount;
    }

    const copyElementCount = Math.min(sourceAvailableElementCount, dstAvailableElementCount);
    length = length || copyElementCount;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(length <= copyElementCount);
    dstData = dstData || new ArrayType(dstElementCount);
    this.gl.bindBuffer(36662, this.handle);
    this.gl.getBufferSubData(36662, srcByteOffset, dstData, dstOffset, length);
    this.gl.bindBuffer(36662, null);
    return dstData;
  }

  bind({
    target = this.target,
    index = this.accessor && this.accessor.index,
    offset = 0,
    size
  } = {}) {
    if (target === 35345 || target === 35982) {
      if (size !== undefined) {
        this.gl.bindBufferRange(target, index, this.handle, offset, size);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(offset === 0);
        this.gl.bindBufferBase(target, index, this.handle);
      }
    } else {
      this.gl.bindBuffer(target, this.handle);
    }

    return this;
  }

  unbind({
    target = this.target,
    index = this.accessor && this.accessor.index
  } = {}) {
    const isIndexedBuffer = target === 35345 || target === 35982;

    if (isIndexedBuffer) {
      this.gl.bindBufferBase(target, index, null);
    } else {
      this.gl.bindBuffer(target, null);
    }

    return this;
  }

  getDebugData() {
    if (!this.debugData) {
      this.debugData = this.getData({
        length: Math.min(DEBUG_DATA_LENGTH, this.byteLength)
      });
      return {
        data: this.debugData,
        changed: true
      };
    }

    return {
      data: this.debugData,
      changed: false
    };
  }

  invalidateDebugData() {
    this.debugData = null;
  }

  _setData(data, offset = 0, byteLength = data.byteLength + offset) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(ArrayBuffer.isView(data));

    this._trackDeallocatedMemory();

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, byteLength, this.usage);
    this.gl.bufferSubData(target, offset, data);
    this.gl.bindBuffer(target, null);
    this.debugData = data.slice(0, DEBUG_DATA_LENGTH);
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    const type = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(type);
    this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
      type
    }));
    return this;
  }

  _setByteLength(byteLength, usage = this.usage) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(byteLength >= 0);

    this._trackDeallocatedMemory();

    let data = byteLength;

    if (byteLength === 0) {
      data = new Float32Array(0);
    }

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, data, usage);
    this.gl.bindBuffer(target, null);
    this.usage = usage;
    this.debugData = null;
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    return this;
  }

  _getTarget() {
    return this.gl.webgl2 ? 36663 : this.target;
  }

  _getAvailableElementCount(srcByteOffset) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });
    const sourceElementOffset = srcByteOffset / ArrayType.BYTES_PER_ELEMENT;
    return this.getElementCount() - sourceElementOffset;
  }

  _inferType(data) {
    if (!this.accessor.type) {
      this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
        type: (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data)
      }));
    }
  }

  _createHandle() {
    return this.gl.createBuffer();
  }

  _deleteHandle() {
    this.gl.deleteBuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _getParameter(pname) {
    this.gl.bindBuffer(this.target, this.handle);
    const value = this.gl.getBufferParameter(this.target, pname);
    this.gl.bindBuffer(this.target, null);
    return value;
  }

  get type() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.type', 'Buffer.accessor.type')();
    return this.accessor.type;
  }

  get bytes() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.bytes', 'Buffer.byteLength')();
    return this.byteLength;
  }

  setByteLength(byteLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setByteLength', 'reallocate')();
    return this.reallocate(byteLength);
  }

  updateAccessor(opts) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('updateAccessor(...)', 'setAccessor(new Accessor(buffer.accessor, ...)')();
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, opts);
    return this;
  }

}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "clearBuffer": () => (/* binding */ clearBuffer)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");


const GL_DEPTH_BUFFER_BIT = 0x00000100;
const GL_STENCIL_BUFFER_BIT = 0x00000400;
const GL_COLOR_BUFFER_BIT = 0x00004000;
const GL_COLOR = 0x1800;
const GL_DEPTH = 0x1801;
const GL_STENCIL = 0x1802;
const GL_DEPTH_STENCIL = 0x84f9;
const ERR_ARGUMENTS = 'clear: bad arguments';
function clear(gl, {
  framebuffer = null,
  color = null,
  depth = null,
  stencil = null
} = {}) {
  const parameters = {};

  if (framebuffer) {
    parameters.framebuffer = framebuffer;
  }

  let clearFlags = 0;

  if (color) {
    clearFlags |= GL_COLOR_BUFFER_BIT;

    if (color !== true) {
      parameters.clearColor = color;
    }
  }

  if (depth) {
    clearFlags |= GL_DEPTH_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearDepth = depth;
    }
  }

  if (stencil) {
    clearFlags |= GL_STENCIL_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearStencil = depth;
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(clearFlags !== 0, ERR_ARGUMENTS);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, parameters, () => {
    gl.clear(clearFlags);
  });
}
function clearBuffer(gl, {
  framebuffer = null,
  buffer = GL_COLOR,
  drawBuffer = 0,
  value = [0, 0, 0, 0]
} = {}) {
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, {
    framebuffer
  }, () => {
    switch (buffer) {
      case GL_COLOR:
        switch (value.constructor) {
          case Int32Array:
            gl.clearBufferiv(buffer, drawBuffer, value);
            break;

          case Uint32Array:
            gl.clearBufferuiv(buffer, drawBuffer, value);
            break;

          case Float32Array:
          default:
            gl.clearBufferfv(buffer, drawBuffer, value);
        }

        break;

      case GL_DEPTH:
        gl.clearBufferfv(GL_DEPTH, 0, [value]);
        break;

      case GL_STENCIL:
        gl.clearBufferiv(GL_STENCIL, 0, [value]);
        break;

      case GL_DEPTH_STENCIL:
        const [depth, stencil] = value;
        gl.clearBufferfi(GL_DEPTH_STENCIL, 0, depth, stencil);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(false, ERR_ARGUMENTS);
    }
  });
}
//# sourceMappingURL=clear.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "readPixelsToArray": () => (/* binding */ readPixelsToArray),
/* harmony export */   "readPixelsToBuffer": () => (/* binding */ readPixelsToBuffer),
/* harmony export */   "copyToDataUrl": () => (/* binding */ copyToDataUrl),
/* harmony export */   "copyToImage": () => (/* binding */ copyToImage),
/* harmony export */   "copyToTexture": () => (/* binding */ copyToTexture),
/* harmony export */   "blit": () => (/* binding */ blit)
/* harmony export */ });
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/format-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js");
/* harmony import */ var _webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../webgl-utils/texture-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









function readPixelsToArray(source, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    sourceFormat = 6408
  } = options;
  let {
    sourceAttachment = 36064,
    target = null,
    sourceWidth,
    sourceHeight,
    sourceType
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle,
    attachments
  } = framebuffer;
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;

  if (sourceAttachment === 36064 && handle === null) {
    sourceAttachment = 1028;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(attachments[sourceAttachment]);
  sourceType = sourceType || attachments[sourceAttachment].type;
  target = getPixelArray(target, sourceType, sourceFormat, sourceWidth, sourceHeight);
  sourceType = sourceType || (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getGLTypeFromTypedArray)(target);
  const prevHandle = gl.bindFramebuffer(36160, handle);
  gl.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, target);
  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function readPixelsToBuffer(source, {
  sourceX = 0,
  sourceY = 0,
  sourceFormat = 6408,
  target = null,
  targetByteOffset = 0,
  sourceWidth,
  sourceHeight,
  sourceType
}) {
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(framebuffer.gl);
  sourceType = sourceType || (target ? target.type : 5121);

  if (!target) {
    const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(sourceFormat);
    const byteCount = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glTypeToBytes)(sourceType);
    const byteLength = targetByteOffset + sourceWidth * sourceHeight * components * byteCount;
    target = new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl2, {
      byteLength,
      accessor: {
        type: sourceType,
        size: components
      }
    });
  }

  target.bind({
    target: 35051
  });
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl2, {
    framebuffer
  }, () => {
    gl2.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, targetByteOffset);
  });
  target.unbind({
    target: 35051
  });

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function copyToDataUrl(source, {
  sourceAttachment = 36064,
  targetMaxHeight = Number.MAX_SAFE_INTEGER
} = {}) {
  let data = readPixelsToArray(source, {
    sourceAttachment
  });
  let {
    width,
    height
  } = source;

  while (height > targetMaxHeight) {
    ({
      data,
      width,
      height
    } = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.scalePixels)({
      data,
      width,
      height
    }));
  }

  (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.flipRows)({
    data,
    width,
    height
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
function copyToImage(source, {
  sourceAttachment = 36064,
  targetImage = null
} = {}) {
  const dataUrl = copyToDataUrl(source, {
    sourceAttachment
  });
  targetImage = targetImage || new Image();
  targetImage.src = dataUrl;
  return targetImage;
}
function copyToTexture(source, target, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    targetMipmaplevel = 0,
    targetInternalFormat = 6408
  } = options;
  let {
    targetX,
    targetY,
    targetZ,
    width,
    height
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle
  } = framebuffer;
  const isSubCopy = typeof targetX !== 'undefined' || typeof targetY !== 'undefined' || typeof targetZ !== 'undefined';
  targetX = targetX || 0;
  targetY = targetY || 0;
  targetZ = targetZ || 0;
  const prevHandle = gl.bindFramebuffer(36160, handle);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(target);
  let texture = null;

  if (target instanceof _texture__WEBPACK_IMPORTED_MODULE_5__["default"]) {
    texture = target;
    width = Number.isFinite(width) ? width : texture.width;
    height = Number.isFinite(height) ? height : texture.height;
    texture.bind(0);
    target = texture.target;
  }

  if (!isSubCopy) {
    gl.copyTexImage2D(target, targetMipmaplevel, targetInternalFormat, sourceX, sourceY, width, height, 0);
  } else {
    switch (target) {
      case 3553:
      case 34067:
        gl.copyTexSubImage2D(target, targetMipmaplevel, targetX, targetY, sourceX, sourceY, width, height);
        break;

      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.copyTexSubImage3D(target, targetMipmaplevel, targetX, targetY, targetZ, sourceX, sourceY, width, height);
        break;

      default:
    }
  }

  if (texture) {
    texture.unbind();
  }

  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return texture;
}
function blit(source, target, options = {}) {
  const {
    sourceX0 = 0,
    sourceY0 = 0,
    targetX0 = 0,
    targetY0 = 0,
    color = true,
    depth = false,
    stencil = false,
    filter = 9728
  } = options;
  let {
    sourceX1,
    sourceY1,
    targetX1,
    targetY1,
    sourceAttachment = 36064,
    mask = 0
  } = options;
  const {
    framebuffer: srcFramebuffer,
    deleteFramebuffer: deleteSrcFramebuffer
  } = getFramebuffer(source);
  const {
    framebuffer: dstFramebuffer,
    deleteFramebuffer: deleteDstFramebuffer
  } = getFramebuffer(target);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(srcFramebuffer);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(dstFramebuffer);
  const {
    gl,
    handle,
    width,
    height,
    readBuffer
  } = dstFramebuffer;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

  if (!srcFramebuffer.handle && sourceAttachment === 36064) {
    sourceAttachment = 1028;
  }

  if (color) {
    mask |= 16384;
  }

  if (depth) {
    mask |= 256;
  }

  if (stencil) {
    mask |= 1024;
  }

  if (deleteSrcFramebuffer || deleteDstFramebuffer) {
    if (mask & (256 | 1024)) {
      mask = 16384;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Blitting from or into a Texture object, forcing mask to GL.COLOR_BUFFER_BIT')();
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(mask);
  sourceX1 = sourceX1 === undefined ? srcFramebuffer.width : sourceX1;
  sourceY1 = sourceY1 === undefined ? srcFramebuffer.height : sourceY1;
  targetX1 = targetX1 === undefined ? width : targetX1;
  targetY1 = targetY1 === undefined ? height : targetY1;
  const prevDrawHandle = gl.bindFramebuffer(36009, handle);
  const prevReadHandle = gl.bindFramebuffer(36008, srcFramebuffer.handle);
  gl2.readBuffer(sourceAttachment);
  gl2.blitFramebuffer(sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1, mask, filter);
  gl2.readBuffer(readBuffer);
  gl2.bindFramebuffer(36008, prevReadHandle || null);
  gl2.bindFramebuffer(36009, prevDrawHandle || null);

  if (deleteSrcFramebuffer) {
    srcFramebuffer.delete();
  }

  if (deleteDstFramebuffer) {
    dstFramebuffer.delete();
  }

  return dstFramebuffer;
}

function getFramebuffer(source) {
  if (!(source instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_6__["default"])) {
    return {
      framebuffer: (0,_webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__.toFramebuffer)(source),
      deleteFramebuffer: true
    };
  }

  return {
    framebuffer: source,
    deleteFramebuffer: false
  };
}

function getPixelArray(pixelArray, type, format, width, height) {
  if (pixelArray) {
    return pixelArray;
  }

  type = type || 5121;
  const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getTypedArrayFromGLType)(type, {
    clamped: false
  });
  const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(format);
  return new ArrayType(width * height * components);
}
//# sourceMappingURL=copy-and-blit.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Framebuffer),
/* harmony export */   "FRAMEBUFFER_ATTACHMENT_PARAMETERS": () => (/* binding */ FRAMEBUFFER_ATTACHMENT_PARAMETERS)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture_2d__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _clear__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./clear */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./copy-and-blit.js */ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









const ERR_MULTIPLE_RENDERTARGETS = 'Multiple render targets not supported';
class Framebuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    const {
      colorBufferFloat,
      colorBufferHalfFloat
    } = options;
    let supported = true;

    if (colorBufferFloat) {
      supported = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('WEBGL_color_buffer_float') || gl.getExtension('OES_texture_float'));
    }

    if (colorBufferHalfFloat) {
      supported = supported && Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    }

    return supported;
  }

  static getDefaultFramebuffer(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultFramebuffer = gl.luma.defaultFramebuffer || new Framebuffer(gl, {
      id: 'default-framebuffer',
      handle: null,
      attachments: {}
    });
    return gl.luma.defaultFramebuffer;
  }

  get MAX_COLOR_ATTACHMENTS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
  }

  get MAX_DRAW_BUFFERS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.width = null;
    this.height = null;
    this.attachments = {};
    this.readBuffer = 36064;
    this.drawBuffers = [36064];
    this.ownResources = [];
    this.initialize(opts);
    Object.seal(this);
  }

  get color() {
    return this.attachments[36064] || null;
  }

  get texture() {
    return this.attachments[36064] || null;
  }

  get depth() {
    return this.attachments[36096] || this.attachments[33306] || null;
  }

  get stencil() {
    return this.attachments[36128] || this.attachments[33306] || null;
  }

  initialize({
    width = 1,
    height = 1,
    attachments = null,
    color = true,
    depth = true,
    stencil = false,
    check = true,
    readBuffer = undefined,
    drawBuffers = undefined
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width >= 0 && height >= 0, 'Width and height need to be integers');
    this.width = width;
    this.height = height;

    if (attachments) {
      for (const attachment in attachments) {
        const target = attachments[attachment];
        const object = Array.isArray(target) ? target[0] : target;
        object.resize({
          width,
          height
        });
      }
    } else {
      attachments = this._createDefaultAttachments(color, depth, stencil, width, height);
    }

    this.update({
      clearAttachments: true,
      attachments,
      readBuffer,
      drawBuffers
    });

    if (attachments && check) {
      this.checkStatus();
    }
  }

  delete() {
    for (const resource of this.ownResources) {
      resource.delete();
    }

    super.delete();
    return this;
  }

  update({
    attachments = {},
    readBuffer,
    drawBuffers,
    clearAttachments = false,
    resizeAttachments = true
  }) {
    this.attach(attachments, {
      clearAttachments,
      resizeAttachments
    });
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);

    if (readBuffer) {
      this._setReadBuffer(readBuffer);
    }

    if (drawBuffers) {
      this._setDrawBuffers(drawBuffers);
    }

    gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  resize(options = {}) {
    let {
      width,
      height
    } = options;

    if (this.handle === null) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width === undefined && height === undefined);
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      return this;
    }

    if (width === undefined) {
      width = this.gl.drawingBufferWidth;
    }

    if (height === undefined) {
      height = this.gl.drawingBufferHeight;
    }

    if (width !== this.width && height !== this.height) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(2, `Resizing framebuffer ${this.id} to ${width}x${height}`)();
    }

    for (const attachmentPoint in this.attachments) {
      this.attachments[attachmentPoint].resize({
        width,
        height
      });
    }

    this.width = width;
    this.height = height;
    return this;
  }

  attach(attachments, {
    clearAttachments = false,
    resizeAttachments = true
  } = {}) {
    const newAttachments = {};

    if (clearAttachments) {
      Object.keys(this.attachments).forEach(key => {
        newAttachments[key] = null;
      });
    }

    Object.assign(newAttachments, attachments);
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    for (const key in newAttachments) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined, 'Misspelled framebuffer binding point?');
      const attachment = Number(key);
      const descriptor = newAttachments[attachment];
      let object = descriptor;

      if (!object) {
        this._unattach(attachment);
      } else if (object instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
        this._attachRenderbuffer({
          attachment,
          renderbuffer: object
        });
      } else if (Array.isArray(descriptor)) {
        const [texture, layer = 0, level = 0] = descriptor;
        object = texture;

        this._attachTexture({
          attachment,
          texture,
          layer,
          level
        });
      } else {
        this._attachTexture({
          attachment,
          texture: object,
          layer: 0,
          level: 0
        });
      }

      if (resizeAttachments && object) {
        object.resize({
          width: this.width,
          height: this.height
        });
      }
    }

    this.gl.bindFramebuffer(36160, prevHandle || null);
    Object.assign(this.attachments, attachments);
    Object.keys(this.attachments).filter(key => !this.attachments[key]).forEach(key => {
      delete this.attachments[key];
    });
  }

  checkStatus() {
    const {
      gl
    } = this;
    const status = this.getStatus();

    if (status !== 36053) {
      throw new Error(_getFrameBufferStatus(status));
    }

    return this;
  }

  getStatus() {
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);
    const status = gl.checkFramebufferStatus(36160);
    gl.bindFramebuffer(36160, prevHandle || null);
    return status;
  }

  clear(options = {}) {
    const {
      color,
      depth,
      stencil,
      drawBuffers = []
    } = options;
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    if (color || depth || stencil) {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clear)(this.gl, {
        color,
        depth,
        stencil
      });
    }

    drawBuffers.forEach((value, drawBuffer) => {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clearBuffer)(this.gl, {
        drawBuffer,
        value
      });
    });
    this.gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  readPixels(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixels() is no logner supported, use readPixelsToArray(framebuffer)')();
    return null;
  }

  readPixelsToBuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixelsToBuffer()is no logner supported, use readPixelsToBuffer(framebuffer)')();
    return null;
  }

  copyToDataUrl(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToDataUrl() is no logner supported, use copyToDataUrl(framebuffer)')();
    return null;
  }

  copyToImage(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToImage() is no logner supported, use copyToImage(framebuffer)')();
    return null;
  }

  copyToTexture(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToTexture({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  blit(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.blit({...}) is no logner supported, use blit(source, target, opts)')();
    return null;
  }

  invalidate({
    attachments = [],
    x = 0,
    y = 0,
    width,
    height
  }) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const prevHandle = gl2.bindFramebuffer(36008, this.handle);
    const invalidateAll = x === 0 && y === 0 && width === undefined && height === undefined;

    if (invalidateAll) {
      gl2.invalidateFramebuffer(36008, attachments);
    } else {
      gl2.invalidateFramebuffer(36008, attachments, x, y, width, height);
    }

    gl2.bindFramebuffer(36008, prevHandle);
    return this;
  }

  getAttachmentParameter(attachment, pname, keys) {
    let value = this._getAttachmentParameterFallback(pname);

    if (value === null) {
      this.gl.bindFramebuffer(36160, this.handle);
      value = this.gl.getFramebufferAttachmentParameter(36160, attachment, pname);
      this.gl.bindFramebuffer(36160, null);
    }

    if (keys && value > 1000) {
      value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, value);
    }

    return value;
  }

  getAttachmentParameters(attachment = 36064, keys, parameters = this.constructor.ATTACHMENT_PARAMETERS || []) {
    const values = {};

    for (const pname of parameters) {
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, pname) : pname;
      values[key] = this.getAttachmentParameter(attachment, pname, keys);
    }

    return values;
  }

  getParameters(keys = true) {
    const attachments = Object.keys(this.attachments);
    const parameters = {};

    for (const attachmentName of attachments) {
      const attachment = Number(attachmentName);
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, attachment) : attachment;
      parameters[key] = this.getAttachmentParameters(attachment, keys);
    }

    return parameters;
  }

  show() {
    if (typeof window !== 'undefined') {
      window.open((0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this), 'luma-debug-texture');
    }

    return this;
  }

  log(logLevel = 0, message = '') {
    if (logLevel > _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level || typeof window === 'undefined') {
      return this;
    }

    message = message || `Framebuffer ${this.id}`;
    const image = (0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this, {
      targetMaxHeight: 100
    });
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.image({
      logLevel,
      message,
      image
    }, message)();
    return this;
  }

  bind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, this.handle);
    return this;
  }

  unbind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, null);
    return this;
  }

  _createDefaultAttachments(color, depth, stencil, width, height) {
    let defaultAttachments = null;

    if (color) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36064] = new _texture_2d__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        id: `${this.id}-color0`,
        pixels: null,
        format: 6408,
        type: 5121,
        width,
        height,
        mipmaps: false,
        parameters: {
          [10241]: 9729,
          [10240]: 9729,
          [10242]: 33071,
          [10243]: 33071
        }
      });
      this.ownResources.push(defaultAttachments[36064]);
    }

    if (depth && stencil) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[33306] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth-stencil`,
        format: 35056,
        width,
        height: 111
      });
      this.ownResources.push(defaultAttachments[33306]);
    } else if (depth) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36096] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth`,
        format: 33189,
        width,
        height
      });
      this.ownResources.push(defaultAttachments[36096]);
    } else if (stencil) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
    }

    return defaultAttachments;
  }

  _unattach(attachment) {
    const oldAttachment = this.attachments[attachment];

    if (!oldAttachment) {
      return;
    }

    if (oldAttachment instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.gl.framebufferRenderbuffer(36160, attachment, 36161, null);
    } else {
      this.gl.framebufferTexture2D(36160, attachment, 3553, null, 0);
    }

    delete this.attachments[attachment];
  }

  _attachRenderbuffer({
    attachment = 36064,
    renderbuffer
  }) {
    const {
      gl
    } = this;
    gl.framebufferRenderbuffer(36160, attachment, 36161, renderbuffer.handle);
    this.attachments[attachment] = renderbuffer;
  }

  _attachTexture({
    attachment = 36064,
    texture,
    layer,
    level
  }) {
    const {
      gl
    } = this;
    gl.bindTexture(texture.target, texture.handle);

    switch (texture.target) {
      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.framebufferTextureLayer(36160, attachment, texture.target, level, layer);
        break;

      case 34067:
        const face = mapIndexToCubeMapFace(layer);
        gl.framebufferTexture2D(36160, attachment, face, texture.handle, level);
        break;

      case 3553:
        gl.framebufferTexture2D(36160, attachment, 3553, texture.handle, level);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false, 'Illegal texture type');
    }

    gl.bindTexture(texture.target, null);
    this.attachments[attachment] = texture;
  }

  _setReadBuffer(readBuffer) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.getWebGL2Context)(this.gl);

    if (gl2) {
      gl2.readBuffer(readBuffer);
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(readBuffer === 36064 || readBuffer === 1029, ERR_MULTIPLE_RENDERTARGETS);
    }

    this.readBuffer = readBuffer;
  }

  _setDrawBuffers(drawBuffers) {
    const {
      gl
    } = this;
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

    if (gl2) {
      gl2.drawBuffers(drawBuffers);
    } else {
      const ext = gl.getExtension('WEBGL_draw_buffers');

      if (ext) {
        ext.drawBuffersWEBGL(drawBuffers);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(drawBuffers.length === 1 && (drawBuffers[0] === 36064 || drawBuffers[0] === 1029), ERR_MULTIPLE_RENDERTARGETS);
      }
    }

    this.drawBuffers = drawBuffers;
  }

  _getAttachmentParameterFallback(pname) {
    const caps = (0,_features__WEBPACK_IMPORTED_MODULE_8__.getFeatures)(this.gl);

    switch (pname) {
      case 36052:
        return !caps.WEBGL2 ? 0 : null;

      case 33298:
      case 33299:
      case 33300:
      case 33301:
      case 33302:
      case 33303:
        return !caps.WEBGL2 ? 8 : null;

      case 33297:
        return !caps.WEBGL2 ? 5125 : null;

      case 33296:
        return !caps.WEBGL2 && !caps.EXT_sRGB ? 9729 : null;

      default:
        return null;
    }
  }

  _createHandle() {
    return this.gl.createFramebuffer();
  }

  _deleteHandle() {
    this.gl.deleteFramebuffer(this.handle);
  }

  _bindHandle(handle) {
    return this.gl.bindFramebuffer(36160, handle);
  }

}

function mapIndexToCubeMapFace(layer) {
  return layer < 34069 ? layer + 34069 : layer;
}

function _getFrameBufferStatus(status) {
  const STATUS = Framebuffer.STATUS || {};
  return STATUS[status] || `Framebuffer error ${status}`;
}

const FRAMEBUFFER_ATTACHMENT_PARAMETERS = [36049, 36048, 33296, 33298, 33299, 33300, 33301, 33302, 33303];
Framebuffer.ATTACHMENT_PARAMETERS = FRAMEBUFFER_ATTACHMENT_PARAMETERS;
//# sourceMappingURL=framebuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");



class ProgramConfiguration {
  constructor(program) {
    this.id = program.id;
    this.attributeInfos = [];
    this.attributeInfosByName = {};
    this.attributeInfosByLocation = [];
    this.varyingInfos = [];
    this.varyingInfosByName = {};
    Object.seal(this);

    this._readAttributesFromProgram(program);

    this._readVaryingsFromProgram(program);
  }

  getAttributeInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.attributeInfosByLocation[location];
    }

    return this.attributeInfosByName[locationOrName] || null;
  }

  getAttributeLocation(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.location : -1;
  }

  getAttributeAccessor(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.accessor : null;
  }

  getVaryingInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.varyingInfos[location];
    }

    return this.varyingInfosByName[locationOrName] || null;
  }

  getVaryingIndex(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.location : -1;
  }

  getVaryingAccessor(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.accessor : null;
  }

  _readAttributesFromProgram(program) {
    const {
      gl
    } = program;
    const count = gl.getProgramParameter(program.handle, 35721);

    for (let index = 0; index < count; index++) {
      const {
        name,
        type,
        size
      } = gl.getActiveAttrib(program.handle, index);
      const location = gl.getAttribLocation(program.handle, name);

      if (location >= 0) {
        this._addAttribute(location, name, type, size);
      }
    }

    this.attributeInfos.sort((a, b) => a.location - b.location);
  }

  _readVaryingsFromProgram(program) {
    const {
      gl
    } = program;

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      return;
    }

    const count = gl.getProgramParameter(program.handle, 35971);

    for (let location = 0; location < count; location++) {
      const {
        name,
        type,
        size
      } = gl.getTransformFeedbackVarying(program.handle, location);

      this._addVarying(location, name, type, size);
    }

    this.varyingInfos.sort((a, b) => a.location - b.location);
  }

  _addAttribute(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = {
      type,
      size: size * components
    };

    this._inferProperties(location, name, accessor);

    const attributeInfo = {
      location,
      name,
      accessor: new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor)
    };
    this.attributeInfos.push(attributeInfo);
    this.attributeInfosByLocation[location] = attributeInfo;
    this.attributeInfosByName[attributeInfo.name] = attributeInfo;
  }

  _inferProperties(location, name, accessor) {
    if (/instance/i.test(name)) {
      accessor.divisor = 1;
    }
  }

  _addVarying(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"]({
      type,
      size: size * components
    });
    const varying = {
      location,
      name,
      accessor
    };
    this.varyingInfos.push(varying);
    this.varyingInfosByName[varying.name] = varying;
  }

}
//# sourceMappingURL=program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Program)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _uniforms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./uniforms */ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js");
/* harmony import */ var _shader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shader */ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js");
/* harmony import */ var _program_configuration__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./program-configuration */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");












const LOG_PROGRAM_PERF_PRIORITY = 4;
const GL_SEPARATE_ATTRIBS = 0x8c8d;
const V6_DEPRECATED_METHODS = ['setVertexArray', 'setAttributes', 'setBuffers', 'unsetBuffers', 'use', 'getUniformCount', 'getUniformInfo', 'getUniformLocation', 'getUniformValue', 'getVarying', 'getFragDataLocation', 'getAttachedShaders', 'getAttributeCount', 'getAttributeLocation', 'getAttributeInfo'];
class Program extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Program', 'v6.0', V6_DEPRECATED_METHODS);
    this._isCached = false;
    this.initialize(props);
    Object.seal(this);

    this._setId(props.id);
  }

  initialize(props = {}) {
    const {
      hash,
      vs,
      fs,
      varyings,
      bufferMode = GL_SEPARATE_ATTRIBS
    } = props;
    this.hash = hash || '';
    this.vs = typeof vs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader(this.gl, {
      id: `${props.id}-vs`,
      source: vs
    }) : vs;
    this.fs = typeof fs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader(this.gl, {
      id: `${props.id}-fs`,
      source: fs
    }) : fs;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.vs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.fs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader);
    this.uniforms = {};
    this._textureUniforms = {};

    if (varyings && varyings.length > 0) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.varyings = varyings;
      this.gl2.transformFeedbackVaryings(this.handle, varyings, bufferMode);
    }

    this._compileAndLink();

    this._readUniformLocationsFromLinkedProgram();

    this.configuration = new _program_configuration__WEBPACK_IMPORTED_MODULE_4__["default"](this);
    return this.setProps(props);
  }

  delete(options = {}) {
    if (this._isCached) {
      return this;
    }

    return super.delete(options);
  }

  setProps(props) {
    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    return this;
  }

  draw({
    logPriority,
    drawMode = 4,
    vertexCount,
    offset = 0,
    start,
    end,
    isIndexed = false,
    indexType = 5123,
    instanceCount = 0,
    isInstanced = instanceCount > 0,
    vertexArray = null,
    transformFeedback,
    framebuffer,
    parameters = {},
    uniforms,
    samplers
  }) {
    if (uniforms || samplers) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Program.draw({uniforms})', 'Program.setUniforms(uniforms)')();
      this.setUniforms(uniforms || {});
    }

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= logPriority) {
      const fb = framebuffer ? framebuffer.id : 'default';
      const message = `mode=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, drawMode)} verts=${vertexCount} ` + `instances=${instanceCount} indexType=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, indexType)} ` + `isInstanced=${isInstanced} isIndexed=${isIndexed} ` + `Framebuffer=${fb}`;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(logPriority, message)();
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(vertexArray);
    this.gl.useProgram(this.handle);

    if (!this._areTexturesRenderable() || vertexCount === 0 || isInstanced && instanceCount === 0) {
      return false;
    }

    vertexArray.bindForDraw(vertexCount, instanceCount, () => {
      if (framebuffer !== undefined) {
        parameters = Object.assign({}, parameters, {
          framebuffer
        });
      }

      if (transformFeedback) {
        const primitiveMode = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__.getPrimitiveDrawMode)(drawMode);
        transformFeedback.begin(primitiveMode);
      }

      this._bindTextures();

      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
        if (isIndexed && isInstanced) {
          this.gl2.drawElementsInstanced(drawMode, vertexCount, indexType, offset, instanceCount);
        } else if (isIndexed && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl) && !isNaN(start) && !isNaN(end)) {
          this.gl2.drawRangeElements(drawMode, start, end, vertexCount, indexType, offset);
        } else if (isIndexed) {
          this.gl.drawElements(drawMode, vertexCount, indexType, offset);
        } else if (isInstanced) {
          this.gl2.drawArraysInstanced(drawMode, offset, vertexCount, instanceCount);
        } else {
          this.gl.drawArrays(drawMode, offset, vertexCount);
        }
      });

      if (transformFeedback) {
        transformFeedback.end();
      }
    });
    return true;
  }

  setUniforms(uniforms = {}) {
    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= 2) {
      (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.checkUniformValues)(uniforms, this.id, this._uniformSetters);
    }

    this.gl.useProgram(this.handle);

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];
      const uniformSetter = this._uniformSetters[uniformName];

      if (uniformSetter) {
        let value = uniform;
        let textureUpdate = false;

        if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_8__["default"]) {
          value = value.texture;
        }

        if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_9__["default"]) {
          textureUpdate = this.uniforms[uniformName] !== uniform;

          if (textureUpdate) {
            if (uniformSetter.textureIndex === undefined) {
              uniformSetter.textureIndex = this._textureIndexCounter++;
            }

            const texture = value;
            const {
              textureIndex
            } = uniformSetter;
            texture.bind(textureIndex);
            value = textureIndex;
            this._textureUniforms[uniformName] = texture;
          } else {
            value = uniformSetter.textureIndex;
          }
        } else if (this._textureUniforms[uniformName]) {
          delete this._textureUniforms[uniformName];
        }

        if (uniformSetter(value) || textureUpdate) {
          (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.copyUniform)(this.uniforms, uniformName, uniform);
        }
      }
    }

    return this;
  }

  _areTexturesRenderable() {
    let texturesRenderable = true;

    for (const uniformName in this._textureUniforms) {
      const texture = this._textureUniforms[uniformName];
      texture.update();
      texturesRenderable = texturesRenderable && texture.loaded;
    }

    return texturesRenderable;
  }

  _bindTextures() {
    for (const uniformName in this._textureUniforms) {
      const textureIndex = this._uniformSetters[uniformName].textureIndex;

      this._textureUniforms[uniformName].bind(textureIndex);
    }
  }

  _createHandle() {
    return this.gl.createProgram();
  }

  _deleteHandle() {
    this.gl.deleteProgram(this.handle);
  }

  _getOptionsFromHandle(handle) {
    const shaderHandles = this.gl.getAttachedShaders(handle);
    const opts = {};

    for (const shaderHandle of shaderHandles) {
      const type = this.gl.getShaderParameter(this.handle, 35663);

      switch (type) {
        case 35633:
          opts.vs = new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader({
            handle: shaderHandle
          });
          break;

        case 35632:
          opts.fs = new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader({
            handle: shaderHandle
          });
          break;

        default:
      }
    }

    return opts;
  }

  _getParameter(pname) {
    return this.gl.getProgramParameter(this.handle, pname);
  }

  _setId(id) {
    if (!id) {
      const programName = this._getName();

      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_10__.uid)(programName);
    }
  }

  _getName() {
    let programName = this.vs.getName() || this.fs.getName();
    programName = programName.replace(/shader/i, '');
    programName = programName ? `${programName}-program` : 'program';
    return programName;
  }

  _compileAndLink() {
    const {
      gl
    } = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.time(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();
    gl.linkProgram(this.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.timeEnd(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();

    if (gl.debug || _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level > 0) {
      const linked = gl.getProgramParameter(this.handle, 35714);

      if (!linked) {
        throw new Error(`Error linking: ${gl.getProgramInfoLog(this.handle)}`);
      }

      gl.validateProgram(this.handle);
      const validated = gl.getProgramParameter(this.handle, 35715);

      if (!validated) {
        throw new Error(`Error validating: ${gl.getProgramInfoLog(this.handle)}`);
      }
    }
  }

  _readUniformLocationsFromLinkedProgram() {
    const {
      gl
    } = this;
    this._uniformSetters = {};
    this._uniformCount = this._getParameter(35718);

    for (let i = 0; i < this._uniformCount; i++) {
      const info = this.gl.getActiveUniform(this.handle, i);
      const {
        name
      } = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.parseUniformName)(info.name);
      let location = gl.getUniformLocation(this.handle, name);
      this._uniformSetters[name] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);

      if (info.size > 1) {
        for (let l = 0; l < info.size; l++) {
          location = gl.getUniformLocation(this.handle, `${name}[${l}]`);
          this._uniformSetters[`${name}[${l}]`] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);
        }
      }
    }

    this._textureIndexCounter = 0;
  }

  getActiveUniforms(uniformIndices, pname) {
    return this.gl2.getActiveUniforms(this.handle, uniformIndices, pname);
  }

  getUniformBlockIndex(blockName) {
    return this.gl2.getUniformBlockIndex(this.handle, blockName);
  }

  getActiveUniformBlockParameter(blockIndex, pname) {
    return this.gl2.getActiveUniformBlockParameter(this.handle, blockIndex, pname);
  }

  uniformBlockBinding(blockIndex, blockBinding) {
    this.gl2.uniformBlockBinding(this.handle, blockIndex, blockBinding);
  }

}
//# sourceMappingURL=program.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/query.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Query)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");




const GL_QUERY_RESULT = 0x8866;
const GL_QUERY_RESULT_AVAILABLE = 0x8867;
const GL_TIME_ELAPSED_EXT = 0x88bf;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8c88;
const GL_ANY_SAMPLES_PASSED = 0x8c2f;
const GL_ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8d6a;
class Query extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts = []) {
    const webgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
    const hasTimerQuery = (0,_features__WEBPACK_IMPORTED_MODULE_2__.hasFeatures)(gl, _features__WEBPACK_IMPORTED_MODULE_3__.FEATURES.TIMER_QUERY);
    let supported = webgl2 || hasTimerQuery;

    for (const key of opts) {
      switch (key) {
        case 'queries':
          supported = supported && webgl2;
          break;

        case 'timers':
          supported = supported && hasTimerQuery;
          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(false);
      }
    }

    return supported;
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.target = null;
    this._queryPending = false;
    this._pollingPromise = null;
    Object.seal(this);
  }

  beginTimeElapsedQuery() {
    return this.begin(GL_TIME_ELAPSED_EXT);
  }

  beginOcclusionQuery({
    conservative = false
  } = {}) {
    return this.begin(conservative ? GL_ANY_SAMPLES_PASSED_CONSERVATIVE : GL_ANY_SAMPLES_PASSED);
  }

  beginTransformFeedbackQuery() {
    return this.begin(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
  }

  begin(target) {
    if (this._queryPending) {
      return this;
    }

    this.target = target;
    this.gl2.beginQuery(this.target, this.handle);
    return this;
  }

  end() {
    if (this._queryPending) {
      return this;
    }

    if (this.target) {
      this.gl2.endQuery(this.target);
      this.target = null;
      this._queryPending = true;
    }

    return this;
  }

  isResultAvailable() {
    if (!this._queryPending) {
      return false;
    }

    const resultAvailable = this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT_AVAILABLE);

    if (resultAvailable) {
      this._queryPending = false;
    }

    return resultAvailable;
  }

  isTimerDisjoint() {
    return this.gl2.getParameter(GL_GPU_DISJOINT_EXT);
  }

  getResult() {
    return this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT);
  }

  getTimerMilliseconds() {
    return this.getResult() / 1e6;
  }

  createPoll(limit = Number.POSITIVE_INFINITY) {
    if (this._pollingPromise) {
      return this._pollingPromise;
    }

    let counter = 0;
    this._pollingPromise = new Promise((resolve, reject) => {
      const poll = () => {
        if (this.isResultAvailable()) {
          resolve(this.getResult());
          this._pollingPromise = null;
        } else if (counter++ > limit) {
          reject('Timed out');
          this._pollingPromise = null;
        } else {
          requestAnimationFrame(poll);
        }
      };

      requestAnimationFrame(poll);
    });
    return this._pollingPromise;
  }

  _createHandle() {
    return Query.isSupported(this.gl) ? this.gl2.createQuery() : null;
  }

  _deleteHandle() {
    this.gl2.deleteQuery(this.handle);
  }

}
//# sourceMappingURL=query.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const EXT_FLOAT_WEBGL2 = 'EXT_color_buffer_float';
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [33189]: {
    bpp: 2
  },
  [33190]: {
    gl2: true,
    bpp: 3
  },
  [36012]: {
    gl2: true,
    bpp: 4
  },
  [36168]: {
    bpp: 1
  },
  [34041]: {
    bpp: 4
  },
  [35056]: {
    gl2: true,
    bpp: 4
  },
  [36013]: {
    gl2: true,
    bpp: 5
  },
  [32854]: {
    bpp: 2
  },
  [36194]: {
    bpp: 2
  },
  [32855]: {
    bpp: 2
  },
  [33321]: {
    gl2: true,
    bpp: 1
  },
  [33330]: {
    gl2: true,
    bpp: 1
  },
  [33329]: {
    gl2: true,
    bpp: 1
  },
  [33332]: {
    gl2: true,
    bpp: 2
  },
  [33331]: {
    gl2: true,
    bpp: 2
  },
  [33334]: {
    gl2: true,
    bpp: 4
  },
  [33333]: {
    gl2: true,
    bpp: 4
  },
  [33323]: {
    gl2: true,
    bpp: 2
  },
  [33336]: {
    gl2: true,
    bpp: 2
  },
  [33335]: {
    gl2: true,
    bpp: 2
  },
  [33338]: {
    gl2: true,
    bpp: 4
  },
  [33337]: {
    gl2: true,
    bpp: 4
  },
  [33340]: {
    gl2: true,
    bpp: 8
  },
  [33339]: {
    gl2: true,
    bpp: 8
  },
  [32849]: {
    gl2: true,
    bpp: 3
  },
  [32856]: {
    gl2: true,
    bpp: 4
  },
  [32857]: {
    gl2: true,
    bpp: 4
  },
  [36220]: {
    gl2: true,
    bpp: 4
  },
  [36238]: {
    gl2: true,
    bpp: 4
  },
  [36975]: {
    gl2: true,
    bpp: 4
  },
  [36214]: {
    gl2: true,
    bpp: 8
  },
  [36232]: {
    gl2: true,
    bpp: 8
  },
  [36226]: {
    gl2: true,
    bpp: 16
  },
  [36208]: {
    gl2: true,
    bpp: 16
  },
  [33325]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 2
  },
  [33327]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [34842]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [33326]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [33328]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [34836]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 16
  },
  [35898]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  }
});
//# sourceMappingURL=renderbuffer-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Renderbuffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function isFormatSupported(gl, format, formats) {
  const info = formats[format];

  if (!info) {
    return false;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;

  if (typeof value === 'string') {
    return gl.getExtension(value);
  }

  return value;
}

class Renderbuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, {
    format
  } = {
    format: null
  }) {
    return !format || isFormatSupported(gl, format, _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"]);
  }

  static getSamplesForFormat(gl, {
    format
  }) {
    return gl.getInternalformatParameter(36161, format, 32937);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.initialize(opts);
    Object.seal(this);
  }

  initialize({
    format,
    width = 1,
    height = 1,
    samples = 0
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(format, 'Needs format');

    this._trackDeallocatedMemory();

    this.gl.bindRenderbuffer(36161, this.handle);

    if (samples !== 0 && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      this.gl.renderbufferStorageMultisample(36161, samples, format, width, height);
    } else {
      this.gl.renderbufferStorage(36161, format, width, height);
    }

    this.format = format;
    this.width = width;
    this.height = height;
    this.samples = samples;

    this._trackAllocatedMemory(this.width * this.height * (this.samples || 1) * _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"][this.format].bpp);

    return this;
  }

  resize({
    width,
    height
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        samples: this.samples
      });
    }

    return this;
  }

  _createHandle() {
    return this.gl.createRenderbuffer();
  }

  _deleteHandle() {
    this.gl.deleteRenderbuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _bindHandle(handle) {
    this.gl.bindRenderbuffer(36161, handle);
  }

  _syncHandle(handle) {
    this.format = this.getParameter(36164);
    this.width = this.getParameter(36162);
    this.height = this.getParameter(36163);
    this.samples = this.getParameter(36011);
  }

  _getParameter(pname) {
    this.gl.bindRenderbuffer(36161, this.handle);
    const value = this.gl.getRenderbufferParameter(36161, pname);
    return value;
  }

}
//# sourceMappingURL=renderbuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Resource)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../init */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_RESOURCE_METHOD_UNDEFINED = 'Resource subclass must define virtual methods';
class Resource {
  constructor(gl, opts = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    const {
      id,
      userData = {}
    } = opts;
    this.gl = gl;
    this.gl2 = gl;
    this.id = id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.uid)(this.constructor.name);
    this.userData = userData;
    this._bound = false;
    this._handle = opts.handle;

    if (this._handle === undefined) {
      this._handle = this._createHandle();
    }

    this.byteLength = 0;

    this._addStats();
  }

  toString() {
    return `${this.constructor.name}(${this.id})`;
  }

  get handle() {
    return this._handle;
  }

  delete({
    deleteChildren = false
  } = {}) {
    const children = this._handle && this._deleteHandle(this._handle);

    if (this._handle) {
      this._removeStats();
    }

    this._handle = null;

    if (children && deleteChildren) {
      children.filter(Boolean).forEach(child => child.delete());
    }

    return this;
  }

  bind(funcOrHandle = this.handle) {
    if (typeof funcOrHandle !== 'function') {
      this._bindHandle(funcOrHandle);

      return this;
    }

    let value;

    if (!this._bound) {
      this._bindHandle(this.handle);

      this._bound = true;
      value = funcOrHandle();
      this._bound = false;

      this._bindHandle(null);
    } else {
      value = funcOrHandle();
    }

    return value;
  }

  unbind() {
    this.bind(null);
  }

  getParameter(pname, opts = {}) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        const webgl1Default = parameter.webgl1;
        const webgl2Default = 'webgl2' in parameter ? parameter.webgl2 : parameter.webgl1;
        const defaultValue = isWebgl2 ? webgl2Default : webgl1Default;
        return defaultValue;
      }
    }

    return this._getParameter(pname, opts);
  }

  getParameters(options = {}) {
    const {
      parameters,
      keys
    } = options;
    const PARAMETERS = this.constructor.PARAMETERS || {};
    const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
    const values = {};
    const parameterKeys = parameters || Object.keys(PARAMETERS);

    for (const pname of parameterKeys) {
      const parameter = PARAMETERS[pname];
      const parameterAvailable = parameter && (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (parameterAvailable) {
        const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, pname) : pname;
        values[key] = this.getParameter(pname, options);

        if (keys && parameter.type === 'GLenum') {
          values[key] = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, values[key]);
        }
      }
    }

    return values;
  }

  setParameter(pname, value) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        throw new Error('Parameter not available on this platform');
      }

      if (parameter.type === 'GLenum') {
        value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(value);
      }
    }

    this._setParameter(pname, value);

    return this;
  }

  setParameters(parameters) {
    for (const pname in parameters) {
      this.setParameter(pname, parameters[pname]);
    }

    return this;
  }

  stubRemovedMethods(className, version, methodNames) {
    return (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__.stubRemovedMethods)(this, className, version, methodNames);
  }

  initialize(opts) {}

  _createHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _deleteHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _bindHandle(handle) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getOptsFromHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getParameter(pname, opts) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _setParameter(pname, value) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _context() {
    this.gl.luma = this.gl.luma || {};
    return this.gl.luma;
  }

  _addStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get('Resources Created').incrementCount();
    stats.get(`${name}s Created`).incrementCount();
    stats.get(`${name}s Active`).incrementCount();
  }

  _removeStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get(`${name}s Active`).decrementCount();
  }

  _trackAllocatedMemory(bytes, name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').addCount(bytes);
    stats.get(`${name} Memory`).addCount(bytes);
    this.byteLength = bytes;
  }

  _trackDeallocatedMemory(name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').subtractCount(this.byteLength);
    stats.get(`${name} Memory`).subtractCount(this.byteLength);
    this.byteLength = 0;
  }

}
//# sourceMappingURL=resource.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shader": () => (/* binding */ Shader),
/* harmony export */   "VertexShader": () => (/* binding */ VertexShader),
/* harmony export */   "FragmentShader": () => (/* binding */ FragmentShader)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");





const ERR_SOURCE = 'Shader: GLSL source code must be a JavaScript string';
class Shader extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static getTypeName(shaderType) {
    switch (shaderType) {
      case 35633:
        return 'vertex-shader';

      case 35632:
        return 'fragment-shader';

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
        return 'unknown';
    }
  }

  constructor(gl, props) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(typeof props.source === 'string', ERR_SOURCE);
    const id = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(props.source, null) || props.id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(`unnamed ${Shader.getTypeName(props.shaderType)}`);
    super(gl, {
      id
    });
    this.shaderType = props.shaderType;
    this.source = props.source;
    this.initialize(props);
  }

  initialize({
    source
  }) {
    const shaderName = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(source, null);

    if (shaderName) {
      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(shaderName);
    }

    this._compile(source);
  }

  getParameter(pname) {
    return this.gl.getShaderParameter(this.handle, pname);
  }

  toString() {
    return `${Shader.getTypeName(this.shaderType)}:${this.id}`;
  }

  getName() {
    return (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(this.source) || 'unnamed-shader';
  }

  getSource() {
    return this.gl.getShaderSource(this.handle);
  }

  getTranslatedSource() {
    const extension = this.gl.getExtension('WEBGL_debug_shaders');
    return extension ? extension.getTranslatedShaderSource(this.handle) : 'No translated source available. WEBGL_debug_shaders not implemented';
  }

  _compile(source = this.source) {
    if (!source.startsWith('#version ')) {
      source = `#version 100\n${source}`;
    }

    this.source = source;
    this.gl.shaderSource(this.handle, this.source);
    this.gl.compileShader(this.handle);
    const compileStatus = this.getParameter(35713);

    if (!compileStatus) {
      const infoLog = this.gl.getShaderInfoLog(this.handle);
      const {
        shaderName,
        errors,
        warnings
      } = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_5__.parseGLSLCompilerError)(infoLog, this.source, this.shaderType, this.id);
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error(`GLSL compilation errors in ${shaderName}\n${errors}`)();
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`GLSL compilation warnings in ${shaderName}\n${warnings}`)();
      throw new Error(`GLSL compilation errors in ${shaderName}`);
    }
  }

  _deleteHandle() {
    this.gl.deleteShader(this.handle);
  }

  _getOptsFromHandle() {
    return {
      type: this.getParameter(35663),
      source: this.getSource()
    };
  }

}
class VertexShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35633
    }));
  }

  _createHandle() {
    return this.gl.createShader(35633);
  }

}
class FragmentShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35632
    }));
  }

  _createHandle() {
    return this.gl.createShader(35632);
  }

}
//# sourceMappingURL=shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture2D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_load_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/load-file */ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js");



class Texture2D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts) {
    return _texture__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(gl, opts);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);

    if (props instanceof Promise || typeof props === 'string') {
      props = {
        data: props
      };
    }

    if (typeof props.data === 'string') {
      props = Object.assign({}, props, {
        data: (0,_utils_load_file__WEBPACK_IMPORTED_MODULE_2__.loadImage)(props.data)
      });
    }

    super(gl, Object.assign({}, props, {
      target: 3553
    }));
    this.initialize(props);
    Object.seal(this);
  }

}
//# sourceMappingURL=texture-2d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture3D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");




class Texture3D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    props = Object.assign({
      depth: 1
    }, props, {
      target: 32879,
      unpackFlipY: false
    });
    super(gl, props);
    this.initialize(props);
    Object.seal(this);
  }

  setImageData({
    level = 0,
    dataFormat = 6408,
    width,
    height,
    depth = 1,
    border = 0,
    format,
    type = 5121,
    offset = 0,
    data,
    parameters = {}
  }) {
    this._trackDeallocatedMemory('Texture');

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (ArrayBuffer.isView(data)) {
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, data);
      }

      if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
        this.gl.bindBuffer(35052, data.handle);
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, offset);
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * this.depth * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

}
//# sourceMappingURL=texture-3d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextureCube)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");


const FACES = [34069, 34070, 34071, 34072, 34073, 34074];
class TextureCube extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    super(gl, Object.assign({}, props, {
      target: 34067
    }));
    this.initialize(props);
    Object.seal(this);
  }

  initialize(props = {}) {
    const {
      mipmaps = true,
      parameters = {}
    } = props;
    this.opts = props;
    this.setCubeMapImageData(props).then(() => {
      this.loaded = true;

      if (mipmaps) {
        this.generateMipmap(props);
      }

      this.setParameters(parameters);
    });
    return this;
  }

  subImage({
    face,
    data,
    x = 0,
    y = 0,
    mipmapLevel = 0
  }) {
    return this._subImage({
      target: face,
      data,
      x,
      y,
      mipmapLevel
    });
  }

  async setCubeMapImageData({
    width,
    height,
    pixels,
    data,
    border = 0,
    format = 6408,
    type = 5121
  }) {
    const {
      gl
    } = this;
    const imageDataMap = pixels || data;
    const resolvedFaces = await Promise.all(FACES.map(face => {
      const facePixels = imageDataMap[face];
      return Promise.all(Array.isArray(facePixels) ? facePixels : [facePixels]);
    }));
    this.bind();
    FACES.forEach((face, index) => {
      if (resolvedFaces[index].length > 1 && this.opts.mipmaps !== false) {
        _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`${this.id} has mipmap and multiple LODs.`)();
      }

      resolvedFaces[index].forEach((image, lodLevel) => {
        if (width && height) {
          gl.texImage2D(face, lodLevel, format, width, height, border, format, type, image);
        } else {
          gl.texImage2D(face, lodLevel, format, format, type, image);
        }
      });
    });
    this.unbind();
  }

  setImageDataForFace(options) {
    const {
      face,
      width,
      height,
      pixels,
      data,
      border = 0,
      format = 6408,
      type = 5121
    } = options;
    const {
      gl
    } = this;
    const imageData = pixels || data;
    this.bind();

    if (imageData instanceof Promise) {
      imageData.then(resolvedImageData => this.setImageDataForFace(Object.assign({}, options, {
        face,
        data: resolvedImageData,
        pixels: resolvedImageData
      })));
    } else if (this.width || this.height) {
      gl.texImage2D(face, 0, format, width, height, border, format, type, imageData);
    } else {
      gl.texImage2D(face, 0, format, format, type, imageData);
    }

    return this;
  }

}
TextureCube.FACES = FACES;
//# sourceMappingURL=texture-cube.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TEXTURE_FORMATS": () => (/* binding */ TEXTURE_FORMATS),
/* harmony export */   "DATA_FORMAT_CHANNELS": () => (/* binding */ DATA_FORMAT_CHANNELS),
/* harmony export */   "TYPE_SIZES": () => (/* binding */ TYPE_SIZES),
/* harmony export */   "isFormatSupported": () => (/* binding */ isFormatSupported),
/* harmony export */   "isLinearFilteringSupported": () => (/* binding */ isLinearFilteringSupported)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

const TEXTURE_FORMATS = {
  [6407]: {
    dataFormat: 6407,
    types: [5121, 33635]
  },
  [6408]: {
    dataFormat: 6408,
    types: [5121, 32819, 32820]
  },
  [6406]: {
    dataFormat: 6406,
    types: [5121]
  },
  [6409]: {
    dataFormat: 6409,
    types: [5121]
  },
  [6410]: {
    dataFormat: 6410,
    types: [5121]
  },
  [33326]: {
    dataFormat: 6403,
    types: [5126],
    gl2: true
  },
  [33328]: {
    dataFormat: 33319,
    types: [5126],
    gl2: true
  },
  [34837]: {
    dataFormat: 6407,
    types: [5126],
    gl2: true
  },
  [34836]: {
    dataFormat: 6408,
    types: [5126],
    gl2: true
  }
};
const DATA_FORMAT_CHANNELS = {
  [6403]: 1,
  [36244]: 1,
  [33319]: 2,
  [33320]: 2,
  [6407]: 3,
  [36248]: 3,
  [6408]: 4,
  [36249]: 4,
  [6402]: 1,
  [34041]: 1,
  [6406]: 1,
  [6409]: 1,
  [6410]: 2
};
const TYPE_SIZES = {
  [5126]: 4,
  [5125]: 4,
  [5124]: 4,
  [5123]: 2,
  [5122]: 2,
  [5131]: 2,
  [5120]: 1,
  [5121]: 1
};
function isFormatSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  if (!info) {
    return false;
  }

  if (info.gl1 === undefined && info.gl2 === undefined) {
    return true;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;
  return typeof value === 'string' ? gl.getExtension(value) : value;
}
function isLinearFilteringSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  switch (info && info.types[0]) {
    case 5126:
      return gl.getExtension('OES_texture_float_linear');

    case 5131:
      return gl.getExtension('OES_texture_half_float_linear');

    default:
      return true;
  }
}
//# sourceMappingURL=texture-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");







const NPOT_MIN_FILTERS = [9729, 9728];

const WebGLBuffer = probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.global.WebGLBuffer || function WebGLBuffer() {};

class Texture extends _resource__WEBPACK_IMPORTED_MODULE_2__["default"] {
  static isSupported(gl, opts = {}) {
    const {
      format,
      linearFiltering
    } = opts;
    let supported = true;

    if (format) {
      supported = supported && (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isFormatSupported)(gl, format);
      supported = supported && (!linearFiltering || (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isLinearFilteringSupported)(gl, format));
    }

    return supported;
  }

  constructor(gl, props) {
    const {
      id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)('texture'),
      handle,
      target
    } = props;
    super(gl, {
      id,
      handle
    });
    this.target = target;
    this.textureUnit = undefined;
    this.loaded = false;
    this.width = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.format = undefined;
    this.type = undefined;
    this.dataFormat = undefined;
    this.border = undefined;
    this.textureUnit = undefined;
    this.mipmaps = undefined;
  }

  toString() {
    return `Texture(${this.id},${this.width}x${this.height})`;
  }

  initialize(props = {}) {
    let data = props.data;

    if (data instanceof Promise) {
      data.then(resolvedImageData => this.initialize(Object.assign({}, props, {
        pixels: resolvedImageData,
        data: resolvedImageData
      })));
      return this;
    }

    const isVideo = typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement;

    if (isVideo && data.readyState < HTMLVideoElement.HAVE_METADATA) {
      this._video = null;
      data.addEventListener('loadeddata', () => this.initialize(props));
      return this;
    }

    const {
      pixels = null,
      format = 6408,
      border = 0,
      recreate = false,
      parameters = {},
      pixelStore = {},
      textureUnit = undefined
    } = props;

    if (!data) {
      data = pixels;
    }

    let {
      width,
      height,
      dataFormat,
      type,
      compressed = false,
      mipmaps = true
    } = props;
    const {
      depth = 0
    } = props;
    ({
      width,
      height,
      compressed,
      dataFormat,
      type
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.format = format;
    this.type = type;
    this.dataFormat = dataFormat;
    this.border = border;
    this.textureUnit = textureUnit;

    if (Number.isFinite(this.textureUnit)) {
      this.gl.activeTexture(33984 + this.textureUnit);
      this.gl.bindTexture(this.target, this.handle);
    }

    if (mipmaps && this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      mipmaps = false;

      this._updateForNPOT(parameters);
    }

    this.mipmaps = mipmaps;
    this.setImageData({
      data,
      width,
      height,
      depth,
      format,
      type,
      dataFormat,
      border,
      mipmaps,
      parameters: pixelStore,
      compressed
    });

    if (mipmaps) {
      this.generateMipmap();
    }

    this.setParameters(parameters);

    if (recreate) {
      this.data = data;
    }

    if (isVideo) {
      this._video = {
        video: data,
        parameters,
        lastTime: data.readyState >= HTMLVideoElement.HAVE_CURRENT_DATA ? data.currentTime : -1
      };
    }

    return this;
  }

  update() {
    if (this._video) {
      const {
        video,
        parameters,
        lastTime
      } = this._video;

      if (lastTime === video.currentTime || video.readyState < HTMLVideoElement.HAVE_CURRENT_DATA) {
        return;
      }

      this.setSubImageData({
        data: video,
        parameters
      });

      if (this.mipmaps) {
        this.generateMipmap();
      }

      this._video.lastTime = video.currentTime;
    }
  }

  resize({
    height,
    width,
    mipmaps = false
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        type: this.type,
        dataFormat: this.dataFormat,
        border: this.border,
        mipmaps
      });
    }

    return this;
  }

  generateMipmap(params = {}) {
    if (this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      return this;
    }

    this.mipmaps = true;
    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, params, () => {
      this.gl.generateMipmap(this.target);
    });
    this.gl.bindTexture(this.target, null);
    return this;
  }

  setImageData(options) {
    this._trackDeallocatedMemory('Texture');

    const {
      target = this.target,
      pixels = null,
      level = 0,
      format = this.format,
      border = this.border,
      offset = 0,
      parameters = {}
    } = options;
    let {
      data = null,
      type = this.type,
      width = this.width,
      height = this.height,
      dataFormat = this.dataFormat,
      compressed = false
    } = options;

    if (!data) {
      data = pixels;
    }

    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    const {
      gl
    } = this;
    gl.bindTexture(this.target, this.handle);
    let dataType = null;
    ({
      data,
      dataType
    } = this._getDataType({
      data,
      compressed
    }));
    let gl2;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      switch (dataType) {
        case 'null':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          break;

        case 'typed-array':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data, offset);
          break;

        case 'buffer':
          gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
          gl2.bindBuffer(35052, data.handle || data);
          gl2.texImage2D(target, level, format, width, height, border, dataFormat, type, offset);
          gl2.bindBuffer(35052, null);
          break;

        case 'browser-object':
          if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          } else {
            gl.texImage2D(target, level, format, dataFormat, type, data);
          }

          break;

        case 'compressed':
          for (const [levelIndex, levelData] of data.entries()) {
            gl.compressedTexImage2D(target, levelIndex, levelData.format, levelData.width, levelData.height, border, levelData.data);
          }

          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false, 'Unknown image data type');
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

  setSubImageData({
    target = this.target,
    pixels = null,
    data = null,
    x = 0,
    y = 0,
    width = this.width,
    height = this.height,
    level = 0,
    format = this.format,
    type = this.type,
    dataFormat = this.dataFormat,
    compressed = false,
    offset = 0,
    border = this.border,
    parameters = {}
  }) {
    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(this.depth === 0, 'texSubImage not supported for 3D textures');

    if (!data) {
      data = pixels;
    }

    if (data && data.data) {
      const ndarray = data;
      data = ndarray.data;
      width = ndarray.shape[0];
      height = ndarray.shape[1];
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      data = data.handle;
    }

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (compressed) {
        this.gl.compressedTexSubImage2D(target, level, x, y, width, height, format, data);
      } else if (data === null) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, null);
      } else if (ArrayBuffer.isView(data)) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data, offset);
      } else if (data instanceof WebGLBuffer) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.bindBuffer(35052, data);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, offset);
        gl2.bindBuffer(35052, null);
      } else if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data);
      } else {
        this.gl.texSubImage2D(target, level, x, y, dataFormat, type, data);
      }
    });
    this.gl.bindTexture(this.target, null);
  }

  copyFramebuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Texture.copyFramebuffer({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  getActiveUnit() {
    return this.gl.getParameter(34016) - 33984;
  }

  bind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, this.handle);
    return textureUnit;
  }

  unbind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, null);
    return textureUnit;
  }

  _getDataType({
    data,
    compressed = false
  }) {
    if (compressed) {
      return {
        data,
        dataType: 'compressed'
      };
    }

    if (data === null) {
      return {
        data,
        dataType: 'null'
      };
    }

    if (ArrayBuffer.isView(data)) {
      return {
        data,
        dataType: 'typed-array'
      };
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      return {
        data: data.handle,
        dataType: 'buffer'
      };
    }

    if (data instanceof WebGLBuffer) {
      return {
        data,
        dataType: 'buffer'
      };
    }

    return {
      data,
      dataType: 'browser-object'
    };
  }

  _deduceParameters(opts) {
    const {
      format,
      data
    } = opts;
    let {
      width,
      height,
      dataFormat,
      type,
      compressed
    } = opts;
    const textureFormat = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TEXTURE_FORMATS[format];
    dataFormat = dataFormat || textureFormat && textureFormat.dataFormat;
    type = type || textureFormat && textureFormat.types[0];
    compressed = compressed || textureFormat && textureFormat.compressed;
    ({
      width,
      height
    } = this._deduceImageSize(data, width, height));
    return {
      dataFormat,
      type,
      compressed,
      width,
      height,
      format,
      data
    };
  }

  _deduceImageSize(data, width, height) {
    let size;

    if (typeof ImageData !== 'undefined' && data instanceof ImageData) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) {
      size = {
        width: data.naturalWidth,
        height: data.naturalHeight
      };
    } else if (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
      size = {
        width: data.videoWidth,
        height: data.videoHeight
      };
    } else if (!data) {
      size = {
        width: width >= 0 ? width : 1,
        height: height >= 0 ? height : 1
      };
    } else {
      size = {
        width,
        height
      };
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(size, 'Could not deduced texture size');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(width === undefined || size.width === width, 'Deduced texture width does not match supplied width');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(height === undefined || size.height === height, 'Deduced texture height does not match supplied height');
    return size;
  }

  _createHandle() {
    return this.gl.createTexture();
  }

  _deleteHandle() {
    this.gl.deleteTexture(this.handle);

    this._trackDeallocatedMemory('Texture');
  }

  _getParameter(pname) {
    switch (pname) {
      case 4096:
        return this.width;

      case 4097:
        return this.height;

      default:
        this.gl.bindTexture(this.target, this.handle);
        const value = this.gl.getTexParameter(this.target, pname);
        this.gl.bindTexture(this.target, null);
        return value;
    }
  }

  _setParameter(pname, param) {
    this.gl.bindTexture(this.target, this.handle);
    param = this._getNPOTParam(pname, param);

    switch (pname) {
      case 33082:
      case 33083:
        this.gl.texParameterf(this.handle, pname, param);
        break;

      case 4096:
      case 4097:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false);
        break;

      default:
        this.gl.texParameteri(this.target, pname, param);
        break;
    }

    this.gl.bindTexture(this.target, null);
    return this;
  }

  _isNPOT() {
    if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      return false;
    }

    if (!this.width || !this.height) {
      return false;
    }

    return !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.width) || !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.height);
  }

  _updateForNPOT(parameters) {
    if (parameters[this.gl.TEXTURE_MIN_FILTER] === undefined) {
      parameters[this.gl.TEXTURE_MIN_FILTER] = this.gl.LINEAR;
    }

    if (parameters[this.gl.TEXTURE_WRAP_S] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_S] = this.gl.CLAMP_TO_EDGE;
    }

    if (parameters[this.gl.TEXTURE_WRAP_T] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_T] = this.gl.CLAMP_TO_EDGE;
    }
  }

  _getNPOTParam(pname, param) {
    if (this._isNPOT()) {
      switch (pname) {
        case 10241:
          if (NPOT_MIN_FILTERS.indexOf(param) === -1) {
            param = 9729;
          }

          break;

        case 10242:
        case 10243:
          if (param !== 33071) {
            param = 33071;
          }

          break;

        default:
          break;
      }
    }

    return param;
  }

}
//# sourceMappingURL=texture.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TransformFeedback)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");




class TransformFeedback extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    super(gl, props);
    this.initialize(props);
    this.stubRemovedMethods('TransformFeedback', 'v6.0', ['pause', 'resume']);
    Object.seal(this);
  }

  initialize(props = {}) {
    this.buffers = {};
    this.unused = {};
    this.configuration = null;
    this.bindOnUse = true;

    if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.isObjectEmpty)(this.buffers)) {
      this.bind(() => this._unbindBuffers());
    }

    this.setProps(props);
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    if ('buffers' in props) {
      this.setBuffers(props.buffers);
    }
  }

  setBuffers(buffers = {}) {
    this.bind(() => {
      for (const bufferName in buffers) {
        this.setBuffer(bufferName, buffers[bufferName]);
      }
    });
    return this;
  }

  setBuffer(locationOrName, bufferOrParams) {
    const location = this._getVaryingIndex(locationOrName);

    const {
      buffer,
      byteSize,
      byteOffset
    } = this._getBufferParams(bufferOrParams);

    if (location < 0) {
      this.unused[locationOrName] = buffer;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(() => `${this.id} unused varying buffer ${locationOrName}`)();
      return this;
    }

    this.buffers[location] = bufferOrParams;

    if (!this.bindOnUse) {
      this._bindBuffer(location, buffer, byteOffset, byteSize);
    }

    return this;
  }

  begin(primitiveMode = 0) {
    this.gl.bindTransformFeedback(36386, this.handle);

    this._bindBuffers();

    this.gl.beginTransformFeedback(primitiveMode);
    return this;
  }

  end() {
    this.gl.endTransformFeedback();

    this._unbindBuffers();

    this.gl.bindTransformFeedback(36386, null);
    return this;
  }

  _getBufferParams(bufferOrParams) {
    let byteOffset;
    let byteSize;
    let buffer;

    if (bufferOrParams instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"] === false) {
      buffer = bufferOrParams.buffer;
      byteSize = bufferOrParams.byteSize;
      byteOffset = bufferOrParams.byteOffset;
    } else {
      buffer = bufferOrParams;
    }

    if (byteOffset !== undefined || byteSize !== undefined) {
      byteOffset = byteOffset || 0;
      byteSize = byteSize || buffer.byteLength - byteOffset;
    }

    return {
      buffer,
      byteOffset,
      byteSize
    };
  }

  _getVaryingInfo(locationOrName) {
    return this.configuration && this.configuration.getVaryingInfo(locationOrName);
  }

  _getVaryingIndex(locationOrName) {
    if (this.configuration) {
      return this.configuration.getVaryingInfo(locationOrName).location;
    }

    const location = Number(locationOrName);
    return Number.isFinite(location) ? location : -1;
  }

  _bindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        const {
          buffer,
          byteSize,
          byteOffset
        } = this._getBufferParams(this.buffers[bufferIndex]);

        this._bindBuffer(bufferIndex, buffer, byteOffset, byteSize);
      }
    }
  }

  _unbindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        this._bindBuffer(bufferIndex, null);
      }
    }
  }

  _bindBuffer(index, buffer, byteOffset = 0, byteSize) {
    const handle = buffer && buffer.handle;

    if (!handle || byteSize === undefined) {
      this.gl.bindBufferBase(35982, index, handle);
    } else {
      this.gl.bindBufferRange(35982, index, handle, byteOffset, byteSize);
    }

    return this;
  }

  _createHandle() {
    return this.gl.createTransformFeedback();
  }

  _deleteHandle() {
    this.gl.deleteTransformFeedback(this.handle);
  }

  _bindHandle(handle) {
    this.gl.bindTransformFeedback(36386, this.handle);
  }

}
//# sourceMappingURL=transform-feedback.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getUniformSetter": () => (/* binding */ getUniformSetter),
/* harmony export */   "parseUniformName": () => (/* binding */ parseUniformName),
/* harmony export */   "checkUniformValues": () => (/* binding */ checkUniformValues),
/* harmony export */   "copyUniform": () => (/* binding */ copyUniform)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





const UNIFORM_SETTERS = {
  [5126]: getArraySetter.bind(null, 'uniform1fv', toFloatArray, 1, setVectorUniform),
  [35664]: getArraySetter.bind(null, 'uniform2fv', toFloatArray, 2, setVectorUniform),
  [35665]: getArraySetter.bind(null, 'uniform3fv', toFloatArray, 3, setVectorUniform),
  [35666]: getArraySetter.bind(null, 'uniform4fv', toFloatArray, 4, setVectorUniform),
  [5124]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35667]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35668]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35669]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35670]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35671]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35672]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35673]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35674]: getArraySetter.bind(null, 'uniformMatrix2fv', toFloatArray, 4, setMatrixUniform),
  [35675]: getArraySetter.bind(null, 'uniformMatrix3fv', toFloatArray, 9, setMatrixUniform),
  [35676]: getArraySetter.bind(null, 'uniformMatrix4fv', toFloatArray, 16, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [5125]: getArraySetter.bind(null, 'uniform1uiv', toUIntArray, 1, setVectorUniform),
  [36294]: getArraySetter.bind(null, 'uniform2uiv', toUIntArray, 2, setVectorUniform),
  [36295]: getArraySetter.bind(null, 'uniform3uiv', toUIntArray, 3, setVectorUniform),
  [36296]: getArraySetter.bind(null, 'uniform4uiv', toUIntArray, 4, setVectorUniform),
  [35685]: getArraySetter.bind(null, 'uniformMatrix2x3fv', toFloatArray, 6, setMatrixUniform),
  [35686]: getArraySetter.bind(null, 'uniformMatrix2x4fv', toFloatArray, 8, setMatrixUniform),
  [35687]: getArraySetter.bind(null, 'uniformMatrix3x2fv', toFloatArray, 6, setMatrixUniform),
  [35688]: getArraySetter.bind(null, 'uniformMatrix3x4fv', toFloatArray, 12, setMatrixUniform),
  [35689]: getArraySetter.bind(null, 'uniformMatrix4x2fv', toFloatArray, 8, setMatrixUniform),
  [35690]: getArraySetter.bind(null, 'uniformMatrix4x3fv', toFloatArray, 12, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [35679]: getSamplerSetter,
  [35682]: getSamplerSetter,
  [36289]: getSamplerSetter,
  [36292]: getSamplerSetter,
  [36293]: getSamplerSetter,
  [36298]: getSamplerSetter,
  [36299]: getSamplerSetter,
  [36300]: getSamplerSetter,
  [36303]: getSamplerSetter,
  [36306]: getSamplerSetter,
  [36307]: getSamplerSetter,
  [36308]: getSamplerSetter,
  [36311]: getSamplerSetter
};
const FLOAT_ARRAY = {};
const INT_ARRAY = {};
const UINT_ARRAY = {};
const array1 = [0];

function toTypedArray(value, uniformLength, Type, cache) {
  if (uniformLength === 1 && typeof value === 'boolean') {
    value = value ? 1 : 0;
  }

  if (Number.isFinite(value)) {
    array1[0] = value;
    value = array1;
  }

  const length = value.length;

  if (length % uniformLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`Uniform size should be multiples of ${uniformLength}`, value)();
  }

  if (value instanceof Type) {
    return value;
  }

  let result = cache[length];

  if (!result) {
    result = new Type(length);
    cache[length] = result;
  }

  for (let i = 0; i < length; i++) {
    result[i] = value[i];
  }

  return result;
}

function toFloatArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Float32Array, FLOAT_ARRAY);
}

function toIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Int32Array, INT_ARRAY);
}

function toUIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Uint32Array, UINT_ARRAY);
}

function getUniformSetter(gl, location, info) {
  const setter = UNIFORM_SETTERS[info.type];

  if (!setter) {
    throw new Error(`Unknown GLSL uniform type ${info.type}`);
  }

  return setter().bind(null, gl, location);
}
function parseUniformName(name) {
  if (name[name.length - 1] !== ']') {
    return {
      name,
      length: 1,
      isArray: false
    };
  }

  const UNIFORM_NAME_REGEXP = /([^[]*)(\[[0-9]+\])?/;
  const matches = name.match(UNIFORM_NAME_REGEXP);

  if (!matches || matches.length < 2) {
    throw new Error(`Failed to parse GLSL uniform name ${name}`);
  }

  return {
    name: matches[1],
    length: matches[2] || 1,
    isArray: Boolean(matches[2])
  };
}
function checkUniformValues(uniforms, source, uniformMap) {
  for (const uniformName in uniforms) {
    const value = uniforms[uniformName];
    const shouldCheck = !uniformMap || Boolean(uniformMap[uniformName]);

    if (shouldCheck && !checkUniformValue(value)) {
      source = source ? `${source} ` : '';
      console.error(`${source} Bad uniform ${uniformName}`, value);
      throw new Error(`${source} Bad uniform ${uniformName}`);
    }
  }

  return true;
}

function checkUniformValue(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return checkUniformArray(value);
  }

  if (isFinite(value)) {
    return true;
  } else if (value === true || value === false) {
    return true;
  } else if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    return true;
  } else if (value instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
    return true;
  } else if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
    return Boolean(value.texture);
  }

  return false;
}

function copyUniform(uniforms, key, value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    if (uniforms[key]) {
      const dest = uniforms[key];

      for (let i = 0, len = value.length; i < len; ++i) {
        dest[i] = value[i];
      }
    } else {
      uniforms[key] = value.slice();
    }
  } else {
    uniforms[key] = value;
  }
}

function checkUniformArray(value) {
  if (value.length === 0) {
    return false;
  }

  const checkLength = Math.min(value.length, 16);

  for (let i = 0; i < checkLength; ++i) {
    if (!Number.isFinite(value[i])) {
      return false;
    }
  }

  return true;
}

function getSamplerSetter() {
  let cache = null;
  return (gl, location, value) => {
    const update = cache !== value;

    if (update) {
      gl.uniform1i(location, value);
      cache = value;
    }

    return update;
  };
}

function getArraySetter(functionName, toArray, size, uniformSetter) {
  let cache = null;
  let cacheLength = null;
  return (gl, location, value) => {
    const arrayValue = toArray(value, size);
    const length = arrayValue.length;
    let update = false;

    if (cache === null) {
      cache = new Float32Array(length);
      cacheLength = length;
      update = true;
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(cacheLength === length, 'Uniform length cannot change.');

      for (let i = 0; i < length; ++i) {
        if (arrayValue[i] !== cache[i]) {
          update = true;
          break;
        }
      }
    }

    if (update) {
      uniformSetter(gl, functionName, location, arrayValue);
      cache.set(arrayValue);
    }

    return update;
  };
}

function setVectorUniform(gl, functionName, location, value) {
  gl[functionName](location, value);
}

function setMatrixUniform(gl, functionName, location, value) {
  gl[functionName](location, false, value);
}
//# sourceMappingURL=uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArrayObject)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/array-utils-flat */ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/env/get-browser.js");






const ERR_ELEMENTS = 'elements must be GL.ELEMENT_ARRAY_BUFFER';
class VertexArrayObject extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    if (options.constantAttributeZero) {
      return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) || (0,probe_gl__WEBPACK_IMPORTED_MODULE_2__["default"])() === 'Chrome';
    }

    return true;
  }

  static getDefaultArray(gl) {
    gl.luma = gl.luma || {};

    if (!gl.luma.defaultVertexArray) {
      gl.luma.defaultVertexArray = new VertexArrayObject(gl, {
        handle: null,
        isDefaultArray: true
      });
    }

    return gl.luma.defaultVertexArray;
  }

  static getMaxAttributes(gl) {
    VertexArrayObject.MAX_ATTRIBUTES = VertexArrayObject.MAX_ATTRIBUTES || gl.getParameter(34921);
    return VertexArrayObject.MAX_ATTRIBUTES;
  }

  static setConstant(gl, location, array) {
    switch (array.constructor) {
      case Float32Array:
        VertexArrayObject._setConstantFloatArray(gl, location, array);

        break;

      case Int32Array:
        VertexArrayObject._setConstantIntArray(gl, location, array);

        break;

      case Uint32Array:
        VertexArrayObject._setConstantUintArray(gl, location, array);

        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    super(gl, Object.assign({}, opts, {
      id
    }));
    this.buffer = null;
    this.bufferValue = null;
    this.isDefaultArray = opts.isDefaultArray || false;
    this.gl2 = gl;
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    super.delete();

    if (this.buffer) {
      this.buffer.delete();
    }

    return this;
  }

  get MAX_ATTRIBUTES() {
    return VertexArrayObject.getMaxAttributes(this.gl);
  }

  initialize(props = {}) {
    return this.setProps(props);
  }

  setProps(props) {
    return this;
  }

  setElementBuffer(elementBuffer = null, opts = {}) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(!elementBuffer || elementBuffer.target === 34963, ERR_ELEMENTS);
    this.bind(() => {
      this.gl.bindBuffer(34963, elementBuffer ? elementBuffer.handle : null);
    });
    return this;
  }

  setBuffer(location, buffer, accessor) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, accessor);
    }

    const {
      size,
      type,
      stride,
      offset,
      normalized,
      integer,
      divisor
    } = accessor;
    const {
      gl,
      gl2
    } = this;
    location = Number(location);
    this.bind(() => {
      gl.bindBuffer(34962, buffer.handle);

      if (integer) {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));
        gl2.vertexAttribIPointer(location, size, type, stride, offset);
      } else {
        gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
      }

      gl.enableVertexAttribArray(location);
      gl2.vertexAttribDivisor(location, divisor || 0);
    });
    return this;
  }

  enable(location, enable = true) {
    const disablingAttributeZero = !enable && location === 0 && !VertexArrayObject.isSupported(this.gl, {
      constantAttributeZero: true
    });

    if (!disablingAttributeZero) {
      location = Number(location);
      this.bind(() => enable ? this.gl.enableVertexAttribArray(location) : this.gl.disableVertexAttribArray(location));
    }

    return this;
  }

  getConstantBuffer(elementCount, value) {
    const constantValue = this._normalizeConstantArrayValue(value);

    const byteLength = constantValue.byteLength * elementCount;
    const length = constantValue.length * elementCount;
    let updateNeeded = !this.buffer;
    this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl, byteLength);
    updateNeeded = updateNeeded || this.buffer.reallocate(byteLength);
    updateNeeded = updateNeeded || !this._compareConstantArrayValues(constantValue, this.bufferValue);

    if (updateNeeded) {
      const typedArray = (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.getScratchArray)(value.constructor, length);
      (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.fillArray)({
        target: typedArray,
        source: constantValue,
        start: 0,
        count: length
      });
      this.buffer.subData(typedArray);
      this.bufferValue = value;
    }

    return this.buffer;
  }

  _normalizeConstantArrayValue(arrayValue) {
    if (Array.isArray(arrayValue)) {
      return new Float32Array(arrayValue);
    }

    return arrayValue;
  }

  _compareConstantArrayValues(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length || v1.constructor !== v2.constructor) {
      return false;
    }

    for (let i = 0; i < v1.length; ++i) {
      if (v1[i] !== v2[i]) {
        return false;
      }
    }

    return true;
  }

  static _setConstantFloatArray(gl, location, array) {
    switch (array.length) {
      case 1:
        gl.vertexAttrib1fv(location, array);
        break;

      case 2:
        gl.vertexAttrib2fv(location, array);
        break;

      case 3:
        gl.vertexAttrib3fv(location, array);
        break;

      case 4:
        gl.vertexAttrib4fv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantIntArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1iv(location, array);
        break;

      case 2:
        gl.vertexAttribI2iv(location, array);
        break;

      case 3:
        gl.vertexAttribI3iv(location, array);
        break;

      case 4:
        gl.vertexAttribI4iv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantUintArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1uiv(location, array);
        break;

      case 2:
        gl.vertexAttribI2uiv(location, array);
        break;

      case 3:
        gl.vertexAttribI3uiv(location, array);
        break;

      case 4:
        gl.vertexAttribI4uiv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  _createHandle() {
    const gl2 = this.gl;
    return gl2.createVertexArray();
  }

  _deleteHandle(handle) {
    this.gl2.deleteVertexArray(handle);
    return [this.elements];
  }

  _bindHandle(handle) {
    this.gl2.bindVertexArray(handle);
  }

  _getParameter(pname, {
    location
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(Number.isFinite(location));
    return this.bind(() => {
      switch (pname) {
        case 34373:
          return this.gl.getVertexAttribOffset(location, pname);

        default:
          return this.gl.getVertexAttrib(location, pname);
      }
    });
  }

}
//# sourceMappingURL=vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArray)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vertex-array-object */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_ATTRIBUTE_TYPE = 'VertexArray: attributes must be Buffers or constants (i.e. typed array)';
const MULTI_LOCATION_ATTRIBUTE_REGEXP = /^(.+)__LOCATION_([0-9]+)$/;
const DEPRECATIONS_V6 = ['setBuffers', 'setGeneric', 'clearBindings', 'setLocations', 'setGenericValues', 'setDivisor', 'enable', 'disable'];
class VertexArray {
  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    this.id = id;
    this.gl = gl;
    this.configuration = null;
    this.elements = null;
    this.elementsAccessor = null;
    this.values = null;
    this.accessors = null;
    this.unused = null;
    this.drawParams = null;
    this.buffer = null;
    this.attributes = {};
    this.vertexArrayObject = new _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"](gl);
    (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__.stubRemovedMethods)(this, 'VertexArray', 'v6.0', DEPRECATIONS_V6);
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    if (this.buffer) {
      this.buffer.delete();
    }

    this.vertexArrayObject.delete();
  }

  initialize(props = {}) {
    this.reset();
    this.configuration = null;
    this.bindOnUse = false;
    return this.setProps(props);
  }

  reset() {
    this.elements = null;
    this.elementsAccessor = null;
    const {
      MAX_ATTRIBUTES
    } = this.vertexArrayObject;
    this.values = new Array(MAX_ATTRIBUTES).fill(null);
    this.accessors = new Array(MAX_ATTRIBUTES).fill(null);
    this.unused = {};
    this.drawParams = null;
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('elements' in props) {
      this.setElementBuffer(props.elements);
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    return this;
  }

  clearDrawParams() {
    this.drawParams = null;
  }

  getDrawParams() {
    this.drawParams = this.drawParams || this._updateDrawParams();
    return this.drawParams;
  }

  setAttributes(attributes) {
    Object.assign(this.attributes, attributes);
    this.vertexArrayObject.bind(() => {
      for (const locationOrName in attributes) {
        const value = attributes[locationOrName];

        this._setAttribute(locationOrName, value);
      }

      this.gl.bindBuffer(34962, null);
    });
    return this;
  }

  setElementBuffer(elementBuffer = null, accessor = {}) {
    this.elements = elementBuffer;
    this.elementsAccessor = accessor;
    this.clearDrawParams();
    this.vertexArrayObject.setElementBuffer(elementBuffer, accessor);
    return this;
  }

  setBuffer(locationOrName, buffer, appAccessor = {}) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, appAccessor);
    }

    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, buffer, buffer.accessor, appAccessor);

    if (location >= 0) {
      this.values[location] = buffer;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.setBuffer(location, buffer, accessor);
    }

    return this;
  }

  setConstant(locationOrName, arrayValue, appAccessor = {}) {
    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, arrayValue, Object.assign({
      size: arrayValue.length
    }, appAccessor));

    if (location >= 0) {
      arrayValue = this.vertexArrayObject._normalizeConstantArrayValue(arrayValue);
      this.values[location] = arrayValue;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.enable(location, false);
    }

    return this;
  }

  unbindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.vertexArrayObject.setElementBuffer(null);
      }

      this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        accessor: {
          size: 4
        }
      });

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        if (this.values[location] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.gl.disableVertexAttribArray(location);
          this.gl.bindBuffer(34962, this.buffer.handle);
          this.gl.vertexAttribPointer(location, 1, 5126, false, 0, 0);
        }
      }
    });
    return this;
  }

  bindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.setElementBuffer(this.elements);
      }

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        const buffer = this.values[location];

        if (buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.setBuffer(location, buffer);
        }
      }
    });
    return this;
  }

  bindForDraw(vertexCount, instanceCount, func) {
    let value;
    this.vertexArrayObject.bind(() => {
      this._setConstantAttributes(vertexCount, instanceCount);

      value = func();
    });
    return value;
  }

  _resolveLocationAndAccessor(locationOrName, value, valueAccessor, appAccessor) {
    const INVALID_RESULT = {
      location: -1,
      accessor: null
    };

    const {
      location,
      name
    } = this._getAttributeIndex(locationOrName);

    if (!Number.isFinite(location) || location < 0) {
      this.unused[locationOrName] = value;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.once(3, () => `unused value ${locationOrName} in ${this.id}`)();
      return INVALID_RESULT;
    }

    const accessInfo = this._getAttributeInfo(name || location);

    if (!accessInfo) {
      return INVALID_RESULT;
    }

    const currentAccessor = this.accessors[location] || {};
    const accessor = _accessor__WEBPACK_IMPORTED_MODULE_4__["default"].resolve(accessInfo.accessor, currentAccessor, valueAccessor, appAccessor);
    const {
      size,
      type
    } = accessor;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(Number.isFinite(size) && Number.isFinite(type));
    return {
      location,
      accessor
    };
  }

  _getAttributeInfo(attributeName) {
    return this.configuration && this.configuration.getAttributeInfo(attributeName);
  }

  _getAttributeIndex(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return {
        location
      };
    }

    const multiLocation = MULTI_LOCATION_ATTRIBUTE_REGEXP.exec(locationOrName);
    const name = multiLocation ? multiLocation[1] : locationOrName;
    const locationOffset = multiLocation ? Number(multiLocation[2]) : 0;

    if (this.configuration) {
      return {
        location: this.configuration.getAttributeLocation(name) + locationOffset,
        name
      };
    }

    return {
      location: -1
    };
  }

  _setAttribute(locationOrName, value) {
    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.setBuffer(locationOrName, value);
    } else if (Array.isArray(value) && value.length && value[0] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value[0];
      const accessor = value[1];
      this.setBuffer(locationOrName, buffer, accessor);
    } else if (ArrayBuffer.isView(value) || Array.isArray(value)) {
      const constant = value;
      this.setConstant(locationOrName, constant);
    } else if (value.buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const accessor = value;
      this.setBuffer(locationOrName, accessor.buffer, accessor);
    } else {
      throw new Error(ERR_ATTRIBUTE_TYPE);
    }
  }

  _setConstantAttributes(vertexCount, instanceCount) {
    const elementCount = Math.max(vertexCount | 0, instanceCount | 0);
    let constant = this.values[0];

    if (ArrayBuffer.isView(constant)) {
      this._setConstantAttributeZero(constant, elementCount);
    }

    for (let location = 1; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      constant = this.values[location];

      if (ArrayBuffer.isView(constant)) {
        this._setConstantAttribute(location, constant);
      }
    }
  }

  _setConstantAttributeZero(constant, elementCount) {
    if (_vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(this.gl, {
      constantAttributeZero: true
    })) {
      this._setConstantAttribute(0, constant);

      return;
    }

    const buffer = this.vertexArrayObject.getConstantBuffer(elementCount, constant);
    this.vertexArrayObject.setBuffer(0, buffer, this.accessors[0]);
  }

  _setConstantAttribute(location, constant) {
    _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].setConstant(this.gl, location, constant);
  }

  _updateDrawParams() {
    const drawParams = {
      isIndexed: false,
      isInstanced: false,
      indexCount: Infinity,
      vertexCount: Infinity,
      instanceCount: Infinity
    };

    for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      this._updateDrawParamsForLocation(drawParams, location);
    }

    if (this.elements) {
      drawParams.elementCount = this.elements.getElementCount(this.elements.accessor);
      drawParams.isIndexed = true;
      drawParams.indexType = this.elementsAccessor.type || this.elements.accessor.type;
      drawParams.indexOffset = this.elementsAccessor.offset || 0;
    }

    if (drawParams.indexCount === Infinity) {
      drawParams.indexCount = 0;
    }

    if (drawParams.vertexCount === Infinity) {
      drawParams.vertexCount = 0;
    }

    if (drawParams.instanceCount === Infinity) {
      drawParams.instanceCount = 0;
    }

    return drawParams;
  }

  _updateDrawParamsForLocation(drawParams, location) {
    const value = this.values[location];
    const accessor = this.accessors[location];

    if (!value) {
      return;
    }

    const {
      divisor
    } = accessor;
    const isInstanced = divisor > 0;
    drawParams.isInstanced = drawParams.isInstanced || isInstanced;

    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value;

      if (isInstanced) {
        const instanceCount = buffer.getVertexCount(accessor);
        drawParams.instanceCount = Math.min(drawParams.instanceCount, instanceCount);
      } else {
        const vertexCount = buffer.getVertexCount(accessor);
        drawParams.vertexCount = Math.min(drawParams.vertexCount, vertexCount);
      }
    }
  }

  setElements(elementBuffer = null, accessor = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setElements', 'setElementBuffer')();
    return this.setElementBuffer(elementBuffer, accessor);
  }

}
//# sourceMappingURL=vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForProgramConfiguration": () => (/* binding */ getDebugTableForProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");

function getDebugTableForProgramConfiguration(config) {
  const table = {};
  const header = `Accessors for ${config.id}`;

  for (const attributeInfo of config.attributeInfos) {
    if (attributeInfo) {
      const glslDeclaration = getGLSLDeclaration(attributeInfo);
      table[`in ${glslDeclaration}`] = {
        [header]: JSON.stringify(attributeInfo.accessor)
      };
    }
  }

  for (const varyingInfo of config.varyingInfos) {
    if (varyingInfo) {
      const glslDeclaration = getGLSLDeclaration(varyingInfo);
      table[`out ${glslDeclaration}`] = {
        [header]: JSON.stringify(varyingInfo.accessor)
      };
    }
  }

  return table;
}

function getGLSLDeclaration(attributeInfo) {
  const {
    type,
    size
  } = attributeInfo.accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__.getCompositeGLType)(type, size);

  if (typeAndName) {
    return `${typeAndName.name} ${attributeInfo.name}`;
  }

  return attributeInfo.name;
}
//# sourceMappingURL=debug-program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForUniforms": () => (/* binding */ getDebugTableForUniforms)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");


function getDebugTableForUniforms({
  header = 'Uniforms',
  program,
  uniforms,
  undefinedOnly = false
}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(program);
  const SHADER_MODULE_UNIFORM_REGEXP = '.*_.*';
  const PROJECT_MODULE_UNIFORM_REGEXP = '.*Matrix';
  const uniformLocations = program._uniformSetters;
  const table = {};
  const uniformNames = Object.keys(uniformLocations).sort();
  let count = 0;

  for (const uniformName of uniformNames) {
    if (!uniformName.match(SHADER_MODULE_UNIFORM_REGEXP) && !uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (!table[uniformName]) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  let unusedCount = 0;
  const unusedTable = {};

  if (!undefinedOnly) {
    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];

      if (!table[uniformName]) {
        unusedCount++;
        unusedTable[uniformName] = {
          Type: `NOT USED: ${uniform}`,
          [header]: (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(uniform)
        };
      }
    }
  }

  return {
    table,
    count,
    unusedTable,
    unusedCount
  };
}

function addUniformToTable({
  table,
  header,
  uniforms,
  uniformName,
  undefinedOnly
}) {
  const value = uniforms[uniformName];
  const isDefined = isUniformDefined(value);

  if (!undefinedOnly || !isDefined) {
    table[uniformName] = {
      [header]: isDefined ? (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(value) : 'N/A',
      'Uniform Type': isDefined ? value : 'NOT PROVIDED'
    };
    return true;
  }

  return false;
}

function isUniformDefined(value) {
  return value !== undefined && value !== null;
}
//# sourceMappingURL=debug-uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForVertexArray": () => (/* binding */ getDebugTableForVertexArray)
/* harmony export */ });
/* harmony import */ var _classes_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");




function getDebugTableForVertexArray({
  vertexArray,
  header = 'Attributes'
}) {
  if (!vertexArray.configuration) {
    return {};
  }

  const table = {};

  if (vertexArray.elements) {
    table.ELEMENT_ARRAY_BUFFER = getDebugTableRow(vertexArray, vertexArray.elements, null, header);
  }

  const attributes = vertexArray.values;

  for (const attributeLocation in attributes) {
    const info = vertexArray._getAttributeInfo(attributeLocation);

    if (info) {
      let rowHeader = `${attributeLocation}: ${info.name}`;
      const accessor = vertexArray.accessors[info.location];

      if (accessor) {
        rowHeader = `${attributeLocation}: ${getGLSLDeclaration(info.name, accessor)}`;
      }

      table[rowHeader] = getDebugTableRow(vertexArray, attributes[attributeLocation], accessor, header);
    }
  }

  return table;
}

function getDebugTableRow(vertexArray, attribute, accessor, header) {
  const {
    gl
  } = vertexArray;

  if (!attribute) {
    return {
      [header]: 'null',
      'Format ': 'N/A'
    };
  }

  let type = 'NOT PROVIDED';
  let size = 1;
  let verts = 0;
  let bytes = 0;
  let isInteger;
  let marker;
  let value;

  if (accessor) {
    type = accessor.type;
    size = accessor.size;
    type = String(type).replace('Array', '');
    isInteger = type.indexOf('nt') !== -1;
  }

  if (attribute instanceof _classes_buffer__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    const buffer = attribute;
    const {
      data,
      changed
    } = buffer.getDebugData();
    marker = changed ? '*' : '';
    value = data;
    bytes = buffer.byteLength;
    verts = bytes / data.BYTES_PER_ELEMENT / size;
    let format;

    if (accessor) {
      const instanced = accessor.divisor > 0;
      format = `${instanced ? 'I ' : 'P '} ${verts} (x${size}=${bytes} bytes ${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__.getKey)(gl, type)})`;
    } else {
      isInteger = true;
      format = `${bytes} bytes`;
    }

    return {
      [header]: `${marker}${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
        size,
        isInteger
      })}`,
      'Format ': format
    };
  }

  value = attribute;
  size = attribute.length;
  type = String(attribute.constructor.name).replace('Array', '');
  isInteger = type.indexOf('nt') !== -1;
  return {
    [header]: `${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
      size,
      isInteger
    })} (constant)`,
    'Format ': `${size}x${type} (constant)`
  };
}

function getGLSLDeclaration(name, accessor) {
  const {
    type,
    size
  } = accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__.getCompositeGLType)(type, size);
  return typeAndName ? `${name} (${typeAndName.name})` : name;
}
//# sourceMappingURL=debug-vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/features.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasFeature": () => (/* binding */ hasFeature),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures),
/* harmony export */   "getFeatures": () => (/* binding */ getFeatures)
/* harmony export */ });
/* harmony import */ var _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webgl-features-table */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");



const LOG_UNSUPPORTED_FEATURE = 2;
function hasFeature(gl, feature) {
  return hasFeatures(gl, feature);
}
function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => {
    return isFeatureSupported(gl, feature);
  });
}
function getFeatures(gl) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  for (const cap in _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    if (gl.luma.caps[cap] === undefined) {
      gl.luma.caps[cap] = isFeatureSupported(gl, cap);
    }
  }

  return gl.luma.caps;
}

function isFeatureSupported(gl, cap) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  if (gl.luma.caps[cap] === undefined) {
    gl.luma.caps[cap] = queryFeature(gl, cap);
  }

  if (!gl.luma.caps[cap]) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(LOG_UNSUPPORTED_FEATURE, `Feature: ${cap} not supported`)();
  }

  return gl.luma.caps[cap];
}

function queryFeature(gl, cap) {
  const feature = _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"][cap];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(feature, cap);
  let isSupported;
  const featureDefinition = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? feature[1] || feature[0] : feature[0];

  if (typeof featureDefinition === 'function') {
    isSupported = featureDefinition(gl);
  } else if (Array.isArray(featureDefinition)) {
    isSupported = true;

    for (const extension of featureDefinition) {
      isSupported = isSupported && Boolean(gl.getExtension(extension));
    }
  } else if (typeof featureDefinition === 'string') {
    isSupported = Boolean(gl.getExtension(featureDefinition));
  } else if (typeof featureDefinition === 'boolean') {
    isSupported = featureDefinition;
  } else {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
  }

  return isSupported;
}
//# sourceMappingURL=features.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");


const FEATURES = {
  WEBGL2: 'WEBGL2',
  VERTEX_ARRAY_OBJECT: 'VERTEX_ARRAY_OBJECT',
  TIMER_QUERY: 'TIMER_QUERY',
  INSTANCED_RENDERING: 'INSTANCED_RENDERING',
  MULTIPLE_RENDER_TARGETS: 'MULTIPLE_RENDER_TARGETS',
  ELEMENT_INDEX_UINT32: 'ELEMENT_INDEX_UINT32',
  BLEND_EQUATION_MINMAX: 'BLEND_EQUATION_MINMAX',
  FLOAT_BLEND: 'FLOAT_BLEND',
  COLOR_ENCODING_SRGB: 'COLOR_ENCODING_SRGB',
  TEXTURE_DEPTH: 'TEXTURE_DEPTH',
  TEXTURE_FLOAT: 'TEXTURE_FLOAT',
  TEXTURE_HALF_FLOAT: 'TEXTURE_HALF_FLOAT',
  TEXTURE_FILTER_LINEAR_FLOAT: 'TEXTURE_FILTER_LINEAR_FLOAT',
  TEXTURE_FILTER_LINEAR_HALF_FLOAT: 'TEXTURE_FILTER_LINEAR_HALF_FLOAT',
  TEXTURE_FILTER_ANISOTROPIC: 'TEXTURE_FILTER_ANISOTROPIC',
  COLOR_ATTACHMENT_RGBA32F: 'COLOR_ATTACHMENT_RGBA32F',
  COLOR_ATTACHMENT_FLOAT: 'COLOR_ATTACHMENT_FLOAT',
  COLOR_ATTACHMENT_HALF_FLOAT: 'COLOR_ATTACHMENT_HALF_FLOAT',
  GLSL_FRAG_DATA: 'GLSL_FRAG_DATA',
  GLSL_FRAG_DEPTH: 'GLSL_FRAG_DEPTH',
  GLSL_DERIVATIVES: 'GLSL_DERIVATIVES',
  GLSL_TEXTURE_LOD: 'GLSL_TEXTURE_LOD'
};

function checkFloat32ColorAttachment(gl) {
  const testTexture = new _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
    format: 6408,
    type: 5126,
    dataFormat: 6408
  });
  const testFb = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__["default"](gl, {
    id: `test-framebuffer`,
    check: false,
    attachments: {
      [36064]: testTexture
    }
  });
  const status = testFb.getStatus();
  testTexture.delete();
  testFb.delete();
  return status === 36053;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [FEATURES.WEBGL2]: [false, true],
  [FEATURES.VERTEX_ARRAY_OBJECT]: ['OES_vertex_array_object', true],
  [FEATURES.TIMER_QUERY]: ['EXT_disjoint_timer_query', 'EXT_disjoint_timer_query_webgl2'],
  [FEATURES.INSTANCED_RENDERING]: ['ANGLE_instanced_arrays', true],
  [FEATURES.MULTIPLE_RENDER_TARGETS]: ['WEBGL_draw_buffers', true],
  [FEATURES.ELEMENT_INDEX_UINT32]: ['OES_element_index_uint', true],
  [FEATURES.BLEND_EQUATION_MINMAX]: ['EXT_blend_minmax', true],
  [FEATURES.FLOAT_BLEND]: ['EXT_float_blend'],
  [FEATURES.COLOR_ENCODING_SRGB]: ['EXT_sRGB', true],
  [FEATURES.TEXTURE_DEPTH]: ['WEBGL_depth_texture', true],
  [FEATURES.TEXTURE_FLOAT]: ['OES_texture_float', true],
  [FEATURES.TEXTURE_HALF_FLOAT]: ['OES_texture_half_float', true],
  [FEATURES.TEXTURE_FILTER_LINEAR_FLOAT]: ['OES_texture_float_linear'],
  [FEATURES.TEXTURE_FILTER_LINEAR_HALF_FLOAT]: ['OES_texture_half_float_linear'],
  [FEATURES.TEXTURE_FILTER_ANISOTROPIC]: ['EXT_texture_filter_anisotropic'],
  [FEATURES.COLOR_ATTACHMENT_RGBA32F]: [checkFloat32ColorAttachment, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_FLOAT]: [false, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_HALF_FLOAT]: ['EXT_color_buffer_half_float'],
  [FEATURES.GLSL_FRAG_DATA]: ['WEBGL_draw_buffers', true],
  [FEATURES.GLSL_FRAG_DEPTH]: ['EXT_frag_depth', true],
  [FEATURES.GLSL_DERIVATIVES]: ['OES_standard_derivatives', true],
  [FEATURES.GLSL_TEXTURE_LOD]: ['EXT_shader_texture_lod', true]
});
//# sourceMappingURL=webgl-features-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ formatGLSLCompilerError),
/* harmony export */   "parseGLSLCompilerError": () => (/* binding */ parseGLSLCompilerError)
/* harmony export */ });
/* harmony import */ var _get_shader_name__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get-shader-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get-shader-type-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js");


function formatGLSLCompilerError(errLog, src, shaderType) {
  const {
    shaderName,
    errors,
    warnings
  } = parseGLSLCompilerError(errLog, src, shaderType);
  return `GLSL compilation error in ${shaderName}\n\n${errors}\n${warnings}`;
}
function parseGLSLCompilerError(errLog, src, shaderType, shaderName) {
  const errorStrings = errLog.split(/\r?\n/);
  const errors = {};
  const warnings = {};
  const name = shaderName || (0,_get_shader_name__WEBPACK_IMPORTED_MODULE_0__["default"])(src) || '(unnamed)';
  const shaderDescription = `${(0,_get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__["default"])(shaderType)} shader ${name}`;

  for (let i = 0; i < errorStrings.length; i++) {
    const errorString = errorStrings[i];

    if (errorString.length <= 1) {
      continue;
    }

    const segments = errorString.split(':');
    const type = segments[0];
    const line = parseInt(segments[2], 10);

    if (isNaN(line)) {
      throw new Error(`GLSL compilation error in ${shaderDescription}: ${errLog}`);
    }

    if (type !== 'WARNING') {
      errors[line] = errorString;
    } else {
      warnings[line] = errorString;
    }
  }

  const lines = addLineNumbers(src);
  return {
    shaderName: shaderDescription,
    errors: formatErrors(errors, lines),
    warnings: formatErrors(warnings, lines)
  };
}

function formatErrors(errors, lines) {
  let message = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!errors[i + 3] && !errors[i + 2] && !errors[i + 1]) {
      continue;
    }

    message += `${line}\n`;

    if (errors[i + 1]) {
      const error = errors[i + 1];
      const segments = error.split(':', 3);
      const type = segments[0];
      const column = parseInt(segments[1], 10) || 0;
      const err = error.substring(segments.join(':').length + 1).trim();
      message += padLeft(`^^^ ${type}: ${err}\n\n`, column);
    }
  }

  return message;
}

function addLineNumbers(string, start = 1, delim = ': ') {
  const lines = string.split(/\r?\n/);
  const maxDigits = String(lines.length + start - 1).length;
  return lines.map((line, i) => {
    const lineNumber = String(i + start);
    const digits = lineNumber.length;
    const prefix = padLeft(lineNumber, maxDigits - digits);
    return prefix + delim + line;
  });
}

function padLeft(string, digits) {
  let result = '';

  for (let i = 0; i < digits; ++i) {
    result += ' ';
  }

  return `${result}${string}`;
}
//# sourceMappingURL=format-glsl-error.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderName)
/* harmony export */ });
function getShaderName(shader, defaultName = 'unnamed') {
  const SHADER_NAME_REGEXP = /#define[\s*]SHADER_NAME[\s*]([A-Za-z0-9_-]+)[\s*]/;
  const match = shader.match(SHADER_NAME_REGEXP);
  return match ? match[1] : defaultName;
}
//# sourceMappingURL=get-shader-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderTypeName)
/* harmony export */ });
const GL_FRAGMENT_SHADER = 0x8b30;
const GL_VERTEX_SHADER = 0x8b31;
function getShaderTypeName(type) {
  switch (type) {
    case GL_FRAGMENT_SHADER:
      return 'fragment';

    case GL_VERTEX_SHADER:
      return 'vertex';

    default:
      return 'unknown type';
  }
}
//# sourceMappingURL=get-shader-type-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/init.js":
/*!******************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/init.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lumaStats": () => (/* binding */ lumaStats),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl */ "./node_modules/@probe.gl/stats/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");



const VERSION =  true ? "8.5.10" : 0;
const STARTUP_MESSAGE = 'set luma.log.level=1 (or higher) to trace rendering';

class StatsManager {
  constructor() {
    this.stats = new Map();
  }

  get(name) {
    if (!this.stats.has(name)) {
      this.stats.set(name, new probe_gl__WEBPACK_IMPORTED_MODULE_1__.Stats({
        id: name
      }));
    }

    return this.stats.get(name);
  }

}

const lumaStats = new StatsManager();

if (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma && probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION !== VERSION) {
  throw new Error(`luma.gl - multiple VERSIONs detected: ${probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION} vs ${VERSION}`);
}

if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma) {
  if ((0,probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.isBrowser)()) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(1, `luma.gl ${VERSION} - ${STARTUP_MESSAGE}`)();
  }

  probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma = probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma || {
    VERSION,
    version: VERSION,
    log: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log,
    stats: lumaStats,
    globals: {
      modules: {},
      nodeIO: {}
    }
  };
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma);
//# sourceMappingURL=init.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getScratchArrayBuffer": () => (/* binding */ getScratchArrayBuffer),
/* harmony export */   "getScratchArray": () => (/* binding */ getScratchArray),
/* harmony export */   "fillArray": () => (/* binding */ fillArray)
/* harmony export */ });
let arrayBuffer = null;
function getScratchArrayBuffer(byteLength) {
  if (!arrayBuffer || arrayBuffer.byteLength < byteLength) {
    arrayBuffer = new ArrayBuffer(byteLength);
  }

  return arrayBuffer;
}
function getScratchArray(Type, length) {
  const scratchArrayBuffer = getScratchArrayBuffer(Type.BYTES_PER_ELEMENT * length);
  return new Type(scratchArrayBuffer, 0, length);
}
function fillArray({
  target,
  source,
  start = 0,
  count = 1
}) {
  const length = source.length;
  const total = count * length;
  let copied = 0;

  for (let i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}
//# sourceMappingURL=array-utils-flat.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js":
/*!**************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkProps": () => (/* binding */ checkProps)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function checkProps(className, props, propChecks) {
  const {
    removedProps = {},
    deprecatedProps = {},
    replacedProps = {}
  } = propChecks;

  for (const propName in removedProps) {
    if (propName in props) {
      const replacementProp = removedProps[propName];
      const replacement = replacementProp ? `${className}.${removedProps[propName]}` : 'N/A';
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`${className}.${propName}`, replacement)();
    }
  }

  for (const propName in deprecatedProps) {
    if (propName in props) {
      const replacementProp = deprecatedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
    }
  }

  let newProps = null;

  for (const propName in replacedProps) {
    if (propName in props) {
      const replacementProp = replacedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
      newProps = newProps || Object.assign({}, props);
      newProps[replacementProp] = props[propName];
      delete newProps[propName];
    }
  }

  return newProps || props;
}
//# sourceMappingURL=check-props.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatValue": () => (/* binding */ formatValue)
/* harmony export */ });
function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += `,${i % size === 0 ? ' ' : ''}`;
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return `${string}${terminator}`;
}

function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}
//# sourceMappingURL=format-value.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setPathPrefix": () => (/* binding */ setPathPrefix),
/* harmony export */   "loadFile": () => (/* binding */ loadFile),
/* harmony export */   "loadImage": () => (/* binding */ loadImage)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

let pathPrefix = '';
function setPathPrefix(prefix) {
  pathPrefix = prefix;
}
function loadFile(url, options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  const dataType = options.dataType || 'text';
  return fetch(url, options).then(res => res[dataType]());
}
function loadImage(url, opts) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () => reject(new Error(`Could not load image ${url}.`));

      image.crossOrigin = opts && opts.crossOrigin || 'anonymous';
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
//# sourceMappingURL=load-file.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stubRemovedMethods": () => (/* binding */ stubRemovedMethods)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function stubRemovedMethods(instance, className, version, methodNames) {
  const upgradeMessage = `See luma.gl ${version} Upgrade Guide at \
https://luma.gl/docs/upgrade-guide`;
  const prototype = Object.getPrototypeOf(instance);
  methodNames.forEach(methodName => {
    if (prototype.methodName) {
      return;
    }

    prototype[methodName] = () => {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`Calling removed method ${className}.${methodName}: `, upgradeMessage)();
      throw new Error(methodName);
    };
  });
}
//# sourceMappingURL=stub-methods.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "uid": () => (/* binding */ uid),
/* harmony export */   "isPowerOfTwo": () => (/* binding */ isPowerOfTwo),
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const uidCounters = {};
function uid(id = 'id') {
  uidCounters[id] = uidCounters[id] || 1;
  const count = uidCounters[id]++;
  return `${id}-${count}`;
}
function isPowerOfTwo(n) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof n === 'number', 'Input must be a number');
  return n && (n & n - 1) === 0;
}
function isObjectEmpty(obj) {
  let isEmpty = true;

  for (const key in obj) {
    isEmpty = false;
    break;
  }

  return isEmpty;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPrimitiveDrawMode": () => (/* binding */ getPrimitiveDrawMode),
/* harmony export */   "getPrimitiveCount": () => (/* binding */ getPrimitiveCount),
/* harmony export */   "getVertexCount": () => (/* binding */ getVertexCount),
/* harmony export */   "decomposeCompositeGLType": () => (/* binding */ decomposeCompositeGLType),
/* harmony export */   "getCompositeGLType": () => (/* binding */ getCompositeGLType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GL_BYTE = 0x1400;
const GL_UNSIGNED_BYTE = 0x1401;
const GL_SHORT = 0x1402;
const GL_UNSIGNED_SHORT = 0x1403;
const GL_POINTS = 0x0;
const GL_LINES = 0x1;
const GL_LINE_LOOP = 0x2;
const GL_LINE_STRIP = 0x3;
const GL_TRIANGLES = 0x4;
const GL_TRIANGLE_STRIP = 0x5;
const GL_TRIANGLE_FAN = 0x6;
const GL_FLOAT = 0x1406;
const GL_FLOAT_VEC2 = 0x8b50;
const GL_FLOAT_VEC3 = 0x8b51;
const GL_FLOAT_VEC4 = 0x8b52;
const GL_INT = 0x1404;
const GL_INT_VEC2 = 0x8b53;
const GL_INT_VEC3 = 0x8b54;
const GL_INT_VEC4 = 0x8b55;
const GL_UNSIGNED_INT = 0x1405;
const GL_UNSIGNED_INT_VEC2 = 0x8dc6;
const GL_UNSIGNED_INT_VEC3 = 0x8dc7;
const GL_UNSIGNED_INT_VEC4 = 0x8dc8;
const GL_BOOL = 0x8b56;
const GL_BOOL_VEC2 = 0x8b57;
const GL_BOOL_VEC3 = 0x8b58;
const GL_BOOL_VEC4 = 0x8b59;
const GL_FLOAT_MAT2 = 0x8b5a;
const GL_FLOAT_MAT3 = 0x8b5b;
const GL_FLOAT_MAT4 = 0x8b5c;
const GL_FLOAT_MAT2x3 = 0x8b65;
const GL_FLOAT_MAT2x4 = 0x8b66;
const GL_FLOAT_MAT3x2 = 0x8b67;
const GL_FLOAT_MAT3x4 = 0x8b68;
const GL_FLOAT_MAT4x2 = 0x8b69;
const GL_FLOAT_MAT4x3 = 0x8b6a;
const COMPOSITE_GL_TYPES = {
  [GL_FLOAT]: [GL_FLOAT, 1, 'float'],
  [GL_FLOAT_VEC2]: [GL_FLOAT, 2, 'vec2'],
  [GL_FLOAT_VEC3]: [GL_FLOAT, 3, 'vec3'],
  [GL_FLOAT_VEC4]: [GL_FLOAT, 4, 'vec4'],
  [GL_INT]: [GL_INT, 1, 'int'],
  [GL_INT_VEC2]: [GL_INT, 2, 'ivec2'],
  [GL_INT_VEC3]: [GL_INT, 3, 'ivec3'],
  [GL_INT_VEC4]: [GL_INT, 4, 'ivec4'],
  [GL_UNSIGNED_INT]: [GL_UNSIGNED_INT, 1, 'uint'],
  [GL_UNSIGNED_INT_VEC2]: [GL_UNSIGNED_INT, 2, 'uvec2'],
  [GL_UNSIGNED_INT_VEC3]: [GL_UNSIGNED_INT, 3, 'uvec3'],
  [GL_UNSIGNED_INT_VEC4]: [GL_UNSIGNED_INT, 4, 'uvec4'],
  [GL_BOOL]: [GL_FLOAT, 1, 'bool'],
  [GL_BOOL_VEC2]: [GL_FLOAT, 2, 'bvec2'],
  [GL_BOOL_VEC3]: [GL_FLOAT, 3, 'bvec3'],
  [GL_BOOL_VEC4]: [GL_FLOAT, 4, 'bvec4'],
  [GL_FLOAT_MAT2]: [GL_FLOAT, 8, 'mat2'],
  [GL_FLOAT_MAT2x3]: [GL_FLOAT, 8, 'mat2x3'],
  [GL_FLOAT_MAT2x4]: [GL_FLOAT, 8, 'mat2x4'],
  [GL_FLOAT_MAT3]: [GL_FLOAT, 12, 'mat3'],
  [GL_FLOAT_MAT3x2]: [GL_FLOAT, 12, 'mat3x2'],
  [GL_FLOAT_MAT3x4]: [GL_FLOAT, 12, 'mat3x4'],
  [GL_FLOAT_MAT4]: [GL_FLOAT, 16, 'mat4'],
  [GL_FLOAT_MAT4x2]: [GL_FLOAT, 16, 'mat4x2'],
  [GL_FLOAT_MAT4x3]: [GL_FLOAT, 16, 'mat4x3']
};
function getPrimitiveDrawMode(drawMode) {
  switch (drawMode) {
    case GL_POINTS:
      return GL_POINTS;

    case GL_LINES:
      return GL_LINES;

    case GL_LINE_STRIP:
      return GL_LINES;

    case GL_LINE_LOOP:
      return GL_LINES;

    case GL_TRIANGLES:
      return GL_TRIANGLES;

    case GL_TRIANGLE_STRIP:
      return GL_TRIANGLES;

    case GL_TRIANGLE_FAN:
      return GL_TRIANGLES;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getPrimitiveCount({
  drawMode,
  vertexCount
}) {
  switch (drawMode) {
    case GL_POINTS:
    case GL_LINE_LOOP:
      return vertexCount;

    case GL_LINES:
      return vertexCount / 2;

    case GL_LINE_STRIP:
      return vertexCount - 1;

    case GL_TRIANGLES:
      return vertexCount / 3;

    case GL_TRIANGLE_STRIP:
    case GL_TRIANGLE_FAN:
      return vertexCount - 2;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getVertexCount({
  drawMode,
  vertexCount
}) {
  const primitiveCount = getPrimitiveCount({
    drawMode,
    vertexCount
  });

  switch (getPrimitiveDrawMode(drawMode)) {
    case GL_POINTS:
      return primitiveCount;

    case GL_LINES:
      return primitiveCount * 2;

    case GL_TRIANGLES:
      return primitiveCount * 3;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function decomposeCompositeGLType(compositeGLType) {
  const typeAndSize = COMPOSITE_GL_TYPES[compositeGLType];

  if (!typeAndSize) {
    return null;
  }

  const [type, components] = typeAndSize;
  return {
    type,
    components
  };
}
function getCompositeGLType(type, components) {
  switch (type) {
    case GL_BYTE:
    case GL_UNSIGNED_BYTE:
    case GL_SHORT:
    case GL_UNSIGNED_SHORT:
      type = GL_FLOAT;
      break;

    default:
  }

  for (const glType in COMPOSITE_GL_TYPES) {
    const [compType, compComponents, name] = COMPOSITE_GL_TYPES[glType];

    if (compType === type && compComponents === components) {
      return {
        glType,
        name
      };
    }
  }

  return null;
}
//# sourceMappingURL=attribute-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getKeyValue": () => (/* binding */ getKeyValue),
/* harmony export */   "getKey": () => (/* binding */ getKey),
/* harmony export */   "getKeyType": () => (/* binding */ getKeyType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function getKeyValue(gl, name) {
  if (typeof name !== 'string') {
    return name;
  }

  const number = Number(name);

  if (!isNaN(number)) {
    return number;
  }

  name = name.replace(/^.*\./, '');
  const value = gl[name];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, `Accessing undefined constant GL.${name}`);
  return value;
}
function getKey(gl, value) {
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
function getKeyType(gl, value) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, 'undefined key');
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
//# sourceMappingURL=constants-to-keys.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "glFormatToComponents": () => (/* binding */ glFormatToComponents),
/* harmony export */   "glTypeToBytes": () => (/* binding */ glTypeToBytes)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function glFormatToComponents(format) {
  switch (format) {
    case 6406:
    case 33326:
    case 6403:
      return 1;

    case 33328:
    case 33319:
      return 2;

    case 6407:
    case 34837:
      return 3;

    case 6408:
    case 34836:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function glTypeToBytes(type) {
  switch (type) {
    case 5121:
      return 1;

    case 33635:
    case 32819:
    case 32820:
      return 2;

    case 5126:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
//# sourceMappingURL=format-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestAnimationFrame": () => (/* binding */ requestAnimationFrame),
/* harmony export */   "cancelAnimationFrame": () => (/* binding */ cancelAnimationFrame)
/* harmony export */ });
function requestAnimationFrame(callback) {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame(callback) : setTimeout(callback, 1000 / 60);
}
function cancelAnimationFrame(timerId) {
  return typeof window !== 'undefined' && window.cancelAnimationFrame ? window.cancelAnimationFrame(timerId) : clearTimeout(timerId);
}
//# sourceMappingURL=request-animation-frame.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cloneTextureFrom": () => (/* binding */ cloneTextureFrom),
/* harmony export */   "toFramebuffer": () => (/* binding */ toFramebuffer)
/* harmony export */ });
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../classes/texture-cube */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js");
/* harmony import */ var _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../classes/texture-3d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js");
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function cloneTextureFrom(refTexture, overrides) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(refTexture instanceof _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__["default"] || refTexture instanceof _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__["default"] || refTexture instanceof _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__["default"]);
  const TextureType = refTexture.constructor;
  const {
    gl,
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  } = refTexture;
  const textureOptions = Object.assign({
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  }, overrides);
  return new TextureType(gl, textureOptions);
}
function toFramebuffer(texture, opts) {
  const {
    gl,
    width,
    height,
    id
  } = texture;
  const framebuffer = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl, Object.assign({}, opts, {
    id: `framebuffer-for-${id}`,
    width,
    height,
    attachments: {
      [36064]: texture
    }
  }));
  return framebuffer;
}
//# sourceMappingURL=texture-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getGLTypeFromTypedArray": () => (/* binding */ getGLTypeFromTypedArray),
/* harmony export */   "getTypedArrayFromGLType": () => (/* binding */ getTypedArrayFromGLType),
/* harmony export */   "flipRows": () => (/* binding */ flipRows),
/* harmony export */   "scalePixels": () => (/* binding */ scalePixels)
/* harmony export */ });
const ERR_TYPE_DEDUCTION = 'Failed to deduce GL constant from typed array';
function getGLTypeFromTypedArray(arrayOrType) {
  const type = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;

  switch (type) {
    case Float32Array:
      return 5126;

    case Uint16Array:
      return 5123;

    case Uint32Array:
      return 5125;

    case Uint8Array:
      return 5121;

    case Uint8ClampedArray:
      return 5121;

    case Int8Array:
      return 5120;

    case Int16Array:
      return 5122;

    case Int32Array:
      return 5124;

    default:
      throw new Error(ERR_TYPE_DEDUCTION);
  }
}
function getTypedArrayFromGLType(glType, {
  clamped = true
} = {}) {
  switch (glType) {
    case 5126:
      return Float32Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return clamped ? Uint8ClampedArray : Uint8Array;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Failed to deduce typed array type from GL constant');
  }
}
function flipRows({
  data,
  width,
  height,
  bytesPerPixel = 4,
  temp
}) {
  const bytesPerRow = width * bytesPerPixel;
  temp = temp || new Uint8Array(bytesPerRow);

  for (let y = 0; y < height / 2; ++y) {
    const topOffset = y * bytesPerRow;
    const bottomOffset = (height - y - 1) * bytesPerRow;
    temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
    data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
    data.set(temp, bottomOffset);
  }
}
function scalePixels({
  data,
  width,
  height
}) {
  const newWidth = Math.round(width / 2);
  const newHeight = Math.round(height / 2);
  const newData = new Uint8Array(newWidth * newHeight * 4);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      for (let c = 0; c < 4; c++) {
        newData[(y * newWidth + x) * 4 + c] = data[(y * 2 * width + x * 2) * 4 + c];
      }
    }
  }

  return {
    data: newData,
    width: newWidth,
    height: newHeight
  };
}
//# sourceMappingURL=typed-array-utils.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stats": () => (/* reexport safe */ _lib_stats__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "Stat": () => (/* reexport safe */ _lib_stat__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "_getHiResTimestamp": () => (/* reexport safe */ _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _lib_stats__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/stats */ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js");
/* harmony import */ var _lib_stat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js":
/*!***********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stat.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stat)
/* harmony export */ });
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");

class Stat {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.sampleSize = 1;
    this.reset();
  }

  setSampleSize(samples) {
    this.sampleSize = samples;
    return this;
  }

  incrementCount() {
    this.addCount(1);
    return this;
  }

  decrementCount() {
    this.subtractCount(1);
    return this;
  }

  addCount(value) {
    this._count += value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  subtractCount(value) {
    this._count -= value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  addTime(time) {
    this._time += time;
    this.lastTiming = time;
    this._samples++;

    this._checkSampling();

    return this;
  }

  timeStart() {
    this._startTime = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])();
    this._timerPending = true;
    return this;
  }

  timeEnd() {
    if (!this._timerPending) {
      return this;
    }

    this.addTime((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])() - this._startTime);
    this._timerPending = false;

    this._checkSampling();

    return this;
  }

  getSampleAverageCount() {
    return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
  }

  getSampleAverageTime() {
    return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
  }

  getSampleHz() {
    return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1000) : 0;
  }

  getAverageCount() {
    return this.samples > 0 ? this.count / this.samples : 0;
  }

  getAverageTime() {
    return this.samples > 0 ? this.time / this.samples : 0;
  }

  getHz() {
    return this.time > 0 ? this.samples / (this.time / 1000) : 0;
  }

  reset() {
    this.time = 0;
    this.count = 0;
    this.samples = 0;
    this.lastTiming = 0;
    this.lastSampleTime = 0;
    this.lastSampleCount = 0;
    this._count = 0;
    this._time = 0;
    this._samples = 0;
    this._startTime = 0;
    this._timerPending = false;
    return this;
  }

  _checkSampling() {
    if (this._samples === this.sampleSize) {
      this.lastSampleTime = this._time;
      this.lastSampleCount = this._count;
      this.count += this._count;
      this.time += this._time;
      this.samples += this._samples;
      this._time = 0;
      this._count = 0;
      this._samples = 0;
    }
  }

}
//# sourceMappingURL=stat.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js":
/*!************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stats.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stats)
/* harmony export */ });
/* harmony import */ var _stat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");

class Stats {
  constructor({
    id,
    stats
  }) {
    this.id = id;
    this.stats = {};

    this._initializeStats(stats);

    Object.seal(this);
  }

  get(name, type = 'count') {
    return this._getOrCreate({
      name,
      type
    });
  }

  get size() {
    return Object.keys(this.stats).length;
  }

  reset() {
    for (const key in this.stats) {
      this.stats[key].reset();
    }

    return this;
  }

  forEach(fn) {
    for (const key in this.stats) {
      fn(this.stats[key]);
    }
  }

  getTable() {
    const table = {};
    this.forEach(stat => {
      table[stat.name] = {
        time: stat.time || 0,
        count: stat.count || 0,
        average: stat.getAverageTime() || 0,
        hz: stat.getHz() || 0
      };
    });
    return table;
  }

  _initializeStats(stats = []) {
    stats.forEach(stat => this._getOrCreate(stat));
  }

  _getOrCreate(stat) {
    if (!stat || !stat.name) {
      return null;
    }

    const {
      name,
      type
    } = stat;

    if (!this.stats[name]) {
      if (stat instanceof _stat__WEBPACK_IMPORTED_MODULE_0__["default"]) {
        this.stats[name] = stat;
      } else {
        this.stats[name] = new _stat__WEBPACK_IMPORTED_MODULE_0__["default"](name, type);
      }
    }

    return this.stats[name];
  }

}
//# sourceMappingURL=stats.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
function getHiResTimestamp() {
  let timestamp;

  if (typeof window !== 'undefined' && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    const timeParts = process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isMobile = isMobile;
exports["default"] = getBrowser;

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireDefault(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isMobile() {
  return typeof _globals.window.orientation !== 'undefined';
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0, _isBrowser.default)()) {
    return 'Node';
  }

  if ((0, _isElectron.default)(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals.window.chrome) {
    return 'Chrome';
  }

  if (_globals.window.safari) {
    return 'Safari';
  }

  if (_globals.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.console = exports.process = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && process
};
var self_ = globals.self || globals.window || globals.global;
exports.self = self_;
var window_ = globals.window || globals.self || globals.global;
exports.window = window_;
var global_ = globals.global || globals.self || globals.window;
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var process_ = globals.process || {};
exports.process = process_;
var console_ = console;
exports.console = console_;
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "self", ({
  enumerable: true,
  get: function get() {
    return _globals.self;
  }
}));
Object.defineProperty(exports, "window", ({
  enumerable: true,
  get: function get() {
    return _globals.window;
  }
}));
Object.defineProperty(exports, "global", ({
  enumerable: true,
  get: function get() {
    return _globals.global;
  }
}));
Object.defineProperty(exports, "document", ({
  enumerable: true,
  get: function get() {
    return _globals.document;
  }
}));
Object.defineProperty(exports, "process", ({
  enumerable: true,
  get: function get() {
    return _globals.process;
  }
}));
Object.defineProperty(exports, "console", ({
  enumerable: true,
  get: function get() {
    return _globals.console;
  }
}));
Object.defineProperty(exports, "isBrowser", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.default;
  }
}));
Object.defineProperty(exports, "isBrowserMainThread", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.isBrowserMainThread;
  }
}));
Object.defineProperty(exports, "getBrowser", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.default;
  }
}));
Object.defineProperty(exports, "isMobile", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.isMobile;
  }
}));
Object.defineProperty(exports, "isElectron", ({
  enumerable: true,
  get: function get() {
    return _isElectron.default;
  }
}));

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireWildcard(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _getBrowser = _interopRequireWildcard(__webpack_require__(/*! ./get-browser */ "./node_modules/probe.gl/dist/es5/env/get-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBrowser;
exports.isBrowserMainThread = isBrowserMainThread;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isBrowser() {
  var isNode = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0, _isElectron.default)();
}

function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isElectron;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && (0, _typeof2.default)(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && (0, _typeof2.default)(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : (0, _typeof2.default)(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "default": () => (/* binding */ getBrowser)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");
/* harmony import */ var _is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");



function isMobile() {
  return typeof _globals__WEBPACK_IMPORTED_MODULE_0__.window.orientation !== 'undefined';
}
function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0,_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
    return 'Node';
  }

  if ((0,_is_electron__WEBPACK_IMPORTED_MODULE_2__["default"])(mockUserAgent)) {
    return 'Electron';
  }

  const navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  const userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.chrome) {
    return 'Chrome';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.safari) {
    return 'Safari';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* binding */ self_),
/* harmony export */   "window": () => (/* binding */ window_),
/* harmony export */   "global": () => (/* binding */ global_),
/* harmony export */   "document": () => (/* binding */ document_),
/* harmony export */   "process": () => (/* binding */ process_),
/* harmony export */   "console": () => (/* binding */ console_)
/* harmony export */ });
const globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: typeof process === 'object' && process
};
const self_ = globals.self || globals.window || globals.global;
const window_ = globals.window || globals.self || globals.global;
const global_ = globals.global || globals.self || globals.window;
const document_ = globals.document || {};
const process_ = globals.process || {};
const console_ = console;

//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isBrowser),
/* harmony export */   "isBrowserMainThread": () => (/* binding */ isBrowserMainThread)
/* harmony export */ });
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");

function isBrowser() {
  const isNode = typeof process === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0,_is_electron__WEBPACK_IMPORTED_MODULE_0__["default"])();
}
function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isElectron)
/* harmony export */ });
function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  const realUserAgent = typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  const userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/lib/log.js":
/*!***************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/lib/log.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Log),
/* harmony export */   "normalizeArguments": () => (/* binding */ normalizeArguments)
/* harmony export */ });
/* harmony import */ var _utils_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/local-storage */ "./node_modules/probe.gl/dist/esm/utils/local-storage.js");
/* harmony import */ var _utils_formatters__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/formatters */ "./node_modules/probe.gl/dist/esm/utils/formatters.js");
/* harmony import */ var _utils_color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/color */ "./node_modules/probe.gl/dist/esm/utils/color.js");
/* harmony import */ var _utils_autobind__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/autobind */ "./node_modules/probe.gl/dist/esm/utils/autobind.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/probe.gl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js");







const originalConsole = {
  debug: _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
const DEFAULT_SETTINGS = {
  enabled: true,
  level: 0
};

function noop() {}

const cache = {};
const ONCE = {
  once: true
};

function getTableHeader(table) {
  for (const key in table) {
    for (const title in table[key]) {
      return title || 'untitled';
    }
  }

  return 'empty';
}

class Log {
  constructor({
    id
  } = {
    id: ''
  }) {
    this.id = id;
    this.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;
    this._startTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this.LOG_THROTTLE_TIMEOUT = 0;
    this._storage = new _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__["default"]("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
    this.userData = {};
    this.timeStamp("".concat(this.id, " started"));
    (0,_utils_autobind__WEBPACK_IMPORTED_MODULE_3__.autobind)(this);
    Object.seal(this);
  }

  set level(newLevel) {
    this.setLevel(newLevel);
  }

  get level() {
    return this.getLevel();
  }

  isEnabled() {
    return this._storage.config.enabled;
  }

  getLevel() {
    return this._storage.config.level;
  }

  getTotal() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._startTs).toPrecision(10));
  }

  getDelta() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._deltaTs).toPrecision(10));
  }

  set priority(newPriority) {
    this.level = newPriority;
  }

  get priority() {
    return this.level;
  }

  getPriority() {
    return this.level;
  }

  enable(enabled = true) {
    this._storage.updateConfiguration({
      enabled
    });

    return this;
  }

  setLevel(level) {
    this._storage.updateConfiguration({
      level
    });

    return this;
  }

  assert(condition, message) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(condition, message);
  }

  warn(message) {
    return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
  }

  error(message) {
    return this._getLogFunction(0, message, originalConsole.error, arguments);
  }

  deprecated(oldUsage, newUsage) {
    return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
  }

  removed(oldUsage, newUsage) {
    return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
  }

  probe(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
      time: true,
      once: true
    });
  }

  log(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
  }

  info(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.info, arguments);
  }

  once(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
  }

  table(logLevel, table, columns) {
    if (table) {
      return this._getLogFunction(logLevel, table, console.table || noop, columns && [columns], {
        tag: getTableHeader(table)
      });
    }

    return noop;
  }

  image({
    logLevel,
    priority,
    image,
    message = '',
    scale = 1
  }) {
    if (!this._shouldLog(logLevel || priority)) {
      return noop;
    }

    return _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? logImageInBrowser({
      image,
      message,
      scale
    }) : logImageInNode({
      image,
      message,
      scale
    });
  }

  settings() {
    if (console.table) {
      console.table(this._storage.config);
    } else {
      console.log(this._storage.config);
    }
  }

  get(setting) {
    return this._storage.config[setting];
  }

  set(setting, value) {
    this._storage.updateConfiguration({
      [setting]: value
    });
  }

  time(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
  }

  timeEnd(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
  }

  timeStamp(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeStamp || noop);
  }

  group(logLevel, message, opts = {
    collapsed: false
  }) {
    opts = normalizeArguments({
      logLevel,
      message,
      opts
    });
    const {
      collapsed
    } = opts;
    opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
    return this._getLogFunction(opts);
  }

  groupCollapsed(logLevel, message, opts = {}) {
    return this.group(logLevel, message, Object.assign({}, opts, {
      collapsed: true
    }));
  }

  groupEnd(logLevel) {
    return this._getLogFunction(logLevel, '', console.groupEnd || noop);
  }

  withGroup(logLevel, message, func) {
    this.group(logLevel, message)();

    try {
      func();
    } finally {
      this.groupEnd(logLevel)();
    }
  }

  trace() {
    if (console.trace) {
      console.trace();
    }
  }

  _shouldLog(logLevel) {
    return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
  }

  _getLogFunction(logLevel, message, method, args = [], opts) {
    if (this._shouldLog(logLevel)) {
      opts = normalizeArguments({
        logLevel,
        message,
        args,
        opts
      });
      method = method || opts.method;
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(method);
      opts.total = this.getTotal();
      opts.delta = this.getDelta();
      this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
      const tag = opts.tag || opts.message;

      if (opts.once) {
        if (!cache[tag]) {
          cache[tag] = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
        } else {
          return noop;
        }
      }

      message = decorateMessage(this.id, opts.message, opts);
      return method.bind(console, message, ...opts.args);
    }

    return noop;
  }

}
Log.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;

function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }

  let resolvedLevel;

  switch (typeof logLevel) {
    case 'number':
      resolvedLevel = logLevel;
      break;

    case 'object':
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;

    default:
      return 0;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
  return resolvedLevel;
}

function normalizeArguments(opts) {
  const {
    logLevel,
    message
  } = opts;
  opts.logLevel = normalizeLogLevel(logLevel);
  const args = opts.args ? Array.from(opts.args) : [];

  while (args.length && args.shift() !== message) {}

  opts.args = args;

  switch (typeof logLevel) {
    case 'string':
    case 'function':
      if (message !== undefined) {
        args.unshift(message);
      }

      opts.message = logLevel;
      break;

    case 'object':
      Object.assign(opts, logLevel);
      break;

    default:
  }

  if (typeof opts.message === 'function') {
    opts.message = opts.message();
  }

  const messageType = typeof opts.message;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(messageType === 'string' || messageType === 'object');
  return Object.assign(opts, opts.opts);
}

function decorateMessage(id, message, opts) {
  if (typeof message === 'string') {
    const time = opts.time ? (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.leftPad)((0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatTime)(opts.total)) : '';
    message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
    message = (0,_utils_color__WEBPACK_IMPORTED_MODULE_6__.addColor)(message, opts.color, opts.background);
  }

  return message;
}

function logImageInNode({
  image,
  message = '',
  scale = 1
}) {
  let asciify = null;

  try {
    asciify = __webpack_require__(/*! asciify-image */ "?4aee");
  } catch (error) {}

  if (asciify) {
    return () => asciify(image, {
      fit: 'box',
      width: "".concat(Math.round(80 * scale), "%")
    }).then(data => console.log(data));
  }

  return noop;
}

function logImageInBrowser({
  image,
  message = '',
  scale = 1
}) {
  if (typeof image === 'string') {
    const img = new Image();

    img.onload = () => {
      const args = (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale);
      console.log(...args);
    };

    img.src = image;
    return noop;
  }

  const element = image.nodeName || '';

  if (element.toLowerCase() === 'img') {
    console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(image, message, scale));
    return noop;
  }

  if (element.toLowerCase() === 'canvas') {
    const img = new Image();

    img.onload = () => console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale));

    img.src = image.toDataURL();
    return noop;
  }

  return noop;
}
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/assert.js":
/*!********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/assert.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/autobind.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/autobind.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "autobind": () => (/* binding */ autobind)
/* harmony export */ });
function autobind(obj, predefined = ['constructor']) {
  const proto = Object.getPrototypeOf(obj);
  const propNames = Object.getOwnPropertyNames(proto);

  for (const key of propNames) {
    if (typeof obj[key] === 'function') {
      if (!predefined.find(name => key === name)) {
        obj[key] = obj[key].bind(obj);
      }
    }
  }
}
//# sourceMappingURL=autobind.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/color.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/color.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COLOR": () => (/* binding */ COLOR),
/* harmony export */   "addColor": () => (/* binding */ addColor)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");

const COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97
};

function getColor(color) {
  return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
}

function addColor(string, color, background) {
  if (!_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && typeof string === 'string') {
    if (color) {
      color = getColor(color);
      string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
    }

    if (background) {
      color = getColor(background);
      string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
    }
  }

  return string;
}
//# sourceMappingURL=color.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/formatters.js":
/*!************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/formatters.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatTime": () => (/* binding */ formatTime),
/* harmony export */   "leftPad": () => (/* binding */ leftPad),
/* harmony export */   "rightPad": () => (/* binding */ rightPad),
/* harmony export */   "formatValue": () => (/* binding */ formatValue),
/* harmony export */   "formatImage": () => (/* binding */ formatImage)
/* harmony export */ });
function formatTime(ms) {
  let formatted;

  if (ms < 10) {
    formatted = "".concat(ms.toFixed(2), "ms");
  } else if (ms < 100) {
    formatted = "".concat(ms.toFixed(1), "ms");
  } else if (ms < 1000) {
    formatted = "".concat(ms.toFixed(0), "ms");
  } else {
    formatted = "".concat((ms / 1000).toFixed(2), "s");
  }

  return formatted;
}
function leftPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(' '.repeat(padLength)).concat(string);
}
function rightPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(string).concat(' '.repeat(padLength));
}
function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}

function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += ",".concat(i % size === 0 ? ' ' : '');
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return "".concat(string).concat(terminator);
}

function formatImage(image, message, scale, maxWidth = 600) {
  const imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

  if (image.width > maxWidth) {
    scale = Math.min(scale, maxWidth / image.width);
  }

  const width = image.width * scale;
  const height = image.height * scale;
  const style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
  return ["".concat(message, " %c+"), style];
}
//# sourceMappingURL=formatters.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/globals.js":
/*!*********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/globals.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.self),
/* harmony export */   "window": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.window),
/* harmony export */   "global": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.global),
/* harmony export */   "document": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.document),
/* harmony export */   "process": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.process),
/* harmony export */   "console": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.console),
/* harmony export */   "VERSION": () => (/* binding */ VERSION),
/* harmony export */   "isBrowser": () => (/* binding */ isBrowser)
/* harmony export */ });
/* harmony import */ var _env_is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../env/is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _env_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../env/globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");


const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
const isBrowser = (0,_env_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])();
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js":
/*!******************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");

function getHiResTimestamp() {
  let timestamp;

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance) {
    timestamp = _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance.now();
  } else if (_globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime) {
    const timeParts = _globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/local-storage.js":
/*!***************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/local-storage.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorage)
/* harmony export */ });
function getStorage(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}

class LocalStorage {
  constructor(id, defaultSettings, type = 'sessionStorage') {
    this.storage = getStorage(type);
    this.id = id;
    this.config = {};
    Object.assign(this.config, defaultSettings);

    this._loadConfiguration();
  }

  getConfiguration() {
    return this.config;
  }

  setConfiguration(configuration) {
    this.config = {};
    return this.updateConfiguration(configuration);
  }

  updateConfiguration(configuration) {
    Object.assign(this.config, configuration);

    if (this.storage) {
      const serialized = JSON.stringify(this.config);
      this.storage.setItem(this.id, serialized);
    }

    return this;
  }

  _loadConfiguration() {
    let configuration = {};

    if (this.storage) {
      const serializedConfiguration = this.storage.getItem(this.id);
      configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
    }

    Object.assign(this.config, configuration);
    return this;
  }

}
//# sourceMappingURL=local-storage.js.map

/***/ }),

/***/ "?4aee":
/*!*******************************!*\
  !*** asciify-image (ignored) ***!
  \*******************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./demo/index.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js");
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");


const loop = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__["default"]({
    // @ts-ignore
    onInitialize: function ({ gl }) {
        const positions = [0.0, 0.6, 0.6, -0.6, -0.6, -0.6];
        const positionBuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](gl, new Float32Array(positions));
        const model = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_2__["default"](gl, {
            vs: `
            uniform float time;
            attribute vec2 position;
            varying vec2 fPosition;

            mat2 rot(float r) {
                float cr = cos(r);
                float sr = sin(r);
                return mat2(
                    cr, sr,
                    -sr, cr
                );
            }
            void main() {
                fPosition = position;
                gl_Position = vec4(rot(time * 0.001) * position, 0.0, 1.0);
            }
            `,
            fs: `
            varying vec2 fPosition;
            void main() {
                gl_FragColor = vec4(fPosition, length(fPosition), 1.0);
            }
            `,
            attributes: {
                position: positionBuffer,
            },
            vertexCount: positions.length / 2,
        });
        return { model };
    },
    // @ts-ignore
    onRender({ gl, model }) {
        (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__.clear)(gl, { color: [0, 0, 0, 1] });
        const time = performance.now();
        model.setUniforms({ time });
        model.draw();
    },
});
loop.start();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQixxQ0FBcUM7QUFDMUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFF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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSxpQkFBaUIsNkRBQVE7QUFDekI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVPO0FBQ1A7QUFD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O0FBQ0EsSUFBSSxJQUFJO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDNUlBO0FBQ0EsaUVBQWU7QUFDZjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNB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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQSxJQUFJLHlEQUFNO0FBQ1Y7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQSxXQUFXLHFEQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUEsNkNBQTZDO0FBQzdDLHlEQUF5RDtBQUN6RDtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE1B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U0FBUztBQUNULGlCQUFpQjtBQUNqQixLQUFLO0FBQ0w7QUFDQSxlQUFlLFdBQVc7QUFDMUIsUUFBUSxxREFBSyxPQUFPLHFCQUFxQjtBQUN6QztBQUNBLDRCQUE0QixNQUFNO0FBQ2xDO0FBQ0EsS0FBSztBQUNMLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2VuZ2luZS9kaXN0L2VzbS9saWIvYW5pbWF0aW9uLWxvb3AuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZW5naW5lL2Rpc3QvZXNtL2xpYi9tb2RlbC11dGlscy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9lbmdpbmUvZGlzdC9lc20vbGliL21vZGVsLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2VuZ2luZS9kaXN0L2VzbS9saWIvcHJvZ3JhbS1tYW5hZ2VyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vY29udGV4dC9jb250ZXh0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZ2x0b29scy9kaXN0L2VzbS9wb2x5ZmlsbC9nZXQtcGFyYW1ldGVyLXBvbHlmaWxsLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vcG9seWZpbGwvcG9seWZpbGwtY29udGV4dC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3BvbHlmaWxsL3BvbHlmaWxsLXRhYmxlLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vcG9seWZpbGwvcG9seWZpbGwtdmVydGV4LWFycmF5LW9iamVjdC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3N0YXRlLXRyYWNrZXIvdHJhY2stY29udGV4dC1zdGF0ZS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3N0YXRlLXRyYWNrZXIvdW5pZmllZC1wYXJhbWV0ZXItYXBpLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vc3RhdGUtdHJhY2tlci93ZWJnbC1wYXJhbWV0ZXItdGFibGVzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvYXNzZXJ0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvZGV2aWNlLXBpeGVscy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3V0aWxzL2xvZy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3V0aWxzL3V0aWxzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvd2ViZ2wtY2hlY2tzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL2xpYi9hc3NlbWJsZS1zaGFkZXJzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL2xpYi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vbGliL2ZpbHRlcnMvcHJvcC10eXBlcy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvaW5qZWN0LXNoYWRlci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvcGxhdGZvcm0tZGVmaW5lcy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvcmVzb2x2ZS1tb2R1bGVzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL2xpYi9zaGFkZXItbW9kdWxlLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL2xpYi90cmFuc3BpbGUtc2hhZGVyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL21vZHVsZXMvbW9kdWxlLWluamVjdG9ycy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS91dGlscy9hc3NlcnQuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vdXRpbHMvaXMtb2xkLWllLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL3V0aWxzL3dlYmdsLWluZm8uanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9hY2Nlc3Nvci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL2J1ZmZlci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL2NsZWFyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvY29weS1hbmQtYmxpdC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL2ZyYW1lYnVmZmVyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcHJvZ3JhbS1jb25maWd1cmF0aW9uLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3F1ZXJ5LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcmVuZGVyYnVmZmVyLWZvcm1hdHMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9yZW5kZXJidWZmZXIuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9yZXNvdXJjZS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3NoYWRlci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3RleHR1cmUtMmQuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy90ZXh0dXJlLTNkLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS1jdWJlLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS1mb3JtYXRzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3RyYW5zZm9ybS1mZWVkYmFjay5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3VuaWZvcm1zLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdmVydGV4LWFycmF5LW9iamVjdC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3ZlcnRleC1hcnJheS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9kZWJ1Zy9kZWJ1Zy1wcm9ncmFtLWNvbmZpZ3VyYXRpb24uanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZGVidWcvZGVidWctdW5pZm9ybXMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZGVidWcvZGVidWctdmVydGV4LWFycmF5LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2ZlYXR1cmVzL2ZlYXR1cmVzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2ZlYXR1cmVzL3dlYmdsLWZlYXR1cmVzLXRhYmxlLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2dsc2wtdXRpbHMvZm9ybWF0LWdsc2wtZXJyb3IuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZ2xzbC11dGlscy9nZXQtc2hhZGVyLW5hbWUuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZ2xzbC11dGlscy9nZXQtc2hhZGVyLXR5cGUtbmFtZS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9pbml0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL2FycmF5LXV0aWxzLWZsYXQuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvYXNzZXJ0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL2NoZWNrLXByb3BzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL2Zvcm1hdC12YWx1ZS5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS91dGlscy9sb2FkLWZpbGUuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvc3R1Yi1tZXRob2RzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL3V0aWxzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3dlYmdsLXV0aWxzL2F0dHJpYnV0ZS11dGlscy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS93ZWJnbC11dGlscy9mb3JtYXQtdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vd2ViZ2wtdXRpbHMvcmVxdWVzdC1hbmltYXRpb24tZnJhbWUuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vd2ViZ2wtdXRpbHMvdGV4dHVyZS11dGlscy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS93ZWJnbC11dGlscy90eXBlZC1hcnJheS11dGlscy5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9AcHJvYmUuZ2wvc3RhdHMvZGlzdC9lc20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQHByb2JlLmdsL3N0YXRzL2Rpc3QvZXNtL2xpYi9zdGF0LmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL0Bwcm9iZS5nbC9zdGF0cy9kaXN0L2VzbS9saWIvc3RhdHMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvQHByb2JlLmdsL3N0YXRzL2Rpc3QvZXNtL3V0aWxzL2hpLXJlcy10aW1lc3RhbXAuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lczUvZW52L2dldC1icm93c2VyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXM1L2Vudi9nbG9iYWxzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXM1L2Vudi9pbmRleC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzNS9lbnYvaXMtYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzNS9lbnYvaXMtZWxlY3Ryb24uanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vZW52L2dldC1icm93c2VyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL2Vudi9nbG9iYWxzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL2Vudi9pcy1icm93c2VyLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL2Vudi9pcy1lbGVjdHJvbi5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS9saWIvbG9nLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL3V0aWxzL2Fzc2VydC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9hdXRvYmluZC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9jb2xvci5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9mb3JtYXR0ZXJzLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL3V0aWxzL2dsb2JhbHMuanMiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vdXRpbHMvaGktcmVzLXRpbWVzdGFtcC5qcyIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9sb2NhbC1zdG9yYWdlLmpzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlL2lnbm9yZWR8L1VzZXJzL2tpZ3VjaGkvRG9jdW1lbnRzL2dpdC9sdW1hZ2wtZXhhbXBsZS9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vbGlifGFzY2lpZnktaW1hZ2UiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbHVtYWdsLWV4YW1wbGUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9sdW1hZ2wtZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2x1bWFnbC1leGFtcGxlLy4vZGVtby9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJpbXBvcnQgeyBpc1dlYkdMLCBjcmVhdGVHTENvbnRleHQsIGluc3RydW1lbnRHTENvbnRleHQsIHJlc2l6ZUdMQ29udGV4dCwgcmVzZXRQYXJhbWV0ZXJzIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCBRdWVyeSwgbHVtYVN0YXRzLCBGcmFtZWJ1ZmZlciwgbG9nLCBhc3NlcnQgfSBmcm9tICdAbHVtYS5nbC93ZWJnbCc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICdwcm9iZS5nbC9lbnYnO1xuY29uc3QgaXNQYWdlID0gaXNCcm93c2VyKCkgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbmxldCBzdGF0SWRDb3VudGVyID0gMDtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuaW1hdGlvbkxvb3Age1xuICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgb25DcmVhdGVDb250ZXh0ID0gb3B0cyA9PiBjcmVhdGVHTENvbnRleHQob3B0cyksXG4gICAgICBvbkFkZEhUTUwgPSBudWxsLFxuICAgICAgb25Jbml0aWFsaXplID0gKCkgPT4ge30sXG4gICAgICBvblJlbmRlciA9ICgpID0+IHt9LFxuICAgICAgb25GaW5hbGl6ZSA9ICgpID0+IHt9LFxuICAgICAgb25FcnJvcixcbiAgICAgIGdsID0gbnVsbCxcbiAgICAgIGdsT3B0aW9ucyA9IHt9LFxuICAgICAgZGVidWcgPSBmYWxzZSxcbiAgICAgIGNyZWF0ZUZyYW1lYnVmZmVyID0gZmFsc2UsXG4gICAgICBhdXRvUmVzaXplVmlld3BvcnQgPSB0cnVlLFxuICAgICAgYXV0b1Jlc2l6ZURyYXdpbmdCdWZmZXIgPSB0cnVlLFxuICAgICAgc3RhdHMgPSBsdW1hU3RhdHMuZ2V0KGBhbmltYXRpb24tbG9vcC0ke3N0YXRJZENvdW50ZXIrK31gKVxuICAgIH0gPSBwcm9wcztcbiAgICBsZXQge1xuICAgICAgdXNlRGV2aWNlUGl4ZWxzID0gdHJ1ZVxuICAgIH0gPSBwcm9wcztcblxuICAgIGlmICgndXNlRGV2aWNlUGl4ZWxSYXRpbycgaW4gcHJvcHMpIHtcbiAgICAgIGxvZy5kZXByZWNhdGVkKCd1c2VEZXZpY2VQaXhlbFJhdGlvJywgJ3VzZURldmljZVBpeGVscycpKCk7XG4gICAgICB1c2VEZXZpY2VQaXhlbHMgPSBwcm9wcy51c2VEZXZpY2VQaXhlbFJhdGlvO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMgPSB7XG4gICAgICBvbkNyZWF0ZUNvbnRleHQsXG4gICAgICBvbkFkZEhUTUwsXG4gICAgICBvbkluaXRpYWxpemUsXG4gICAgICBvblJlbmRlcixcbiAgICAgIG9uRmluYWxpemUsXG4gICAgICBvbkVycm9yLFxuICAgICAgZ2wsXG4gICAgICBnbE9wdGlvbnMsXG4gICAgICBkZWJ1ZyxcbiAgICAgIGNyZWF0ZUZyYW1lYnVmZmVyXG4gICAgfTtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IG51bGw7XG4gICAgdGhpcy50aW1lbGluZSA9IG51bGw7XG4gICAgdGhpcy5zdGF0cyA9IHN0YXRzO1xuICAgIHRoaXMuY3B1VGltZSA9IHRoaXMuc3RhdHMuZ2V0KCdDUFUgVGltZScpO1xuICAgIHRoaXMuZ3B1VGltZSA9IHRoaXMuc3RhdHMuZ2V0KCdHUFUgVGltZScpO1xuICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5zdGF0cy5nZXQoJ0ZyYW1lIFJhdGUnKTtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9hbmltYXRpb25GcmFtZUlkID0gbnVsbDtcbiAgICB0aGlzLl9uZXh0RnJhbWVQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9yZXNvbHZlTmV4dEZyYW1lID0gbnVsbDtcbiAgICB0aGlzLl9jcHVTdGFydFRpbWUgPSAwO1xuICAgIHRoaXMuc2V0UHJvcHMoe1xuICAgICAgYXV0b1Jlc2l6ZVZpZXdwb3J0LFxuICAgICAgYXV0b1Jlc2l6ZURyYXdpbmdCdWZmZXIsXG4gICAgICB1c2VEZXZpY2VQaXhlbHNcbiAgICB9KTtcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5zdGFydC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RvcCA9IHRoaXMuc3RvcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3BhZ2VMb2FkUHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fb25Nb3VzZW1vdmUgPSB0aGlzLl9vbk1vdXNlbW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTW91c2VsZWF2ZSA9IHRoaXMuX29uTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgdGhpcy5fc2V0RGlzcGxheShudWxsKTtcbiAgfVxuXG4gIHNldE5lZWRzUmVkcmF3KHJlYXNvbikge1xuICAgIGFzc2VydCh0eXBlb2YgcmVhc29uID09PSAnc3RyaW5nJyk7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRoaXMubmVlZHNSZWRyYXcgfHwgcmVhc29uO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoJ2F1dG9SZXNpemVWaWV3cG9ydCcgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuYXV0b1Jlc2l6ZVZpZXdwb3J0ID0gcHJvcHMuYXV0b1Jlc2l6ZVZpZXdwb3J0O1xuICAgIH1cblxuICAgIGlmICgnYXV0b1Jlc2l6ZURyYXdpbmdCdWZmZXInIGluIHByb3BzKSB7XG4gICAgICB0aGlzLmF1dG9SZXNpemVEcmF3aW5nQnVmZmVyID0gcHJvcHMuYXV0b1Jlc2l6ZURyYXdpbmdCdWZmZXI7XG4gICAgfVxuXG4gICAgaWYgKCd1c2VEZXZpY2VQaXhlbHMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnVzZURldmljZVBpeGVscyA9IHByb3BzLnVzZURldmljZVBpeGVscztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0YXJ0KG9wdHMgPSB7fSkge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9ydW5uaW5nID0gdHJ1ZTtcblxuICAgIGNvbnN0IHN0YXJ0UHJvbWlzZSA9IHRoaXMuX2dldFBhZ2VMb2FkUHJvbWlzZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9ydW5uaW5nIHx8IHRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jcmVhdGVXZWJHTENvbnRleHQob3B0cyk7XG5cbiAgICAgIHRoaXMuX2NyZWF0ZUZyYW1lYnVmZmVyKCk7XG5cbiAgICAgIHRoaXMuX3N0YXJ0RXZlbnRIYW5kbGluZygpO1xuXG4gICAgICB0aGlzLl9pbml0aWFsaXplQ2FsbGJhY2tEYXRhKCk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZUNhbGxiYWNrRGF0YSgpO1xuXG4gICAgICB0aGlzLl9yZXNpemVDYW52YXNEcmF3aW5nQnVmZmVyKCk7XG5cbiAgICAgIHRoaXMuX3Jlc2l6ZVZpZXdwb3J0KCk7XG5cbiAgICAgIHRoaXMuX2dwdVRpbWVRdWVyeSA9IFF1ZXJ5LmlzU3VwcG9ydGVkKHRoaXMuZ2wsIFsndGltZXJzJ10pID8gbmV3IFF1ZXJ5KHRoaXMuZ2wpIDogbnVsbDtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLm9uSW5pdGlhbGl6ZSh0aGlzLmFuaW1hdGlvblByb3BzKTtcbiAgICB9KS50aGVuKGFwcENvbnRleHQgPT4ge1xuICAgICAgaWYgKHRoaXMuX3J1bm5pbmcpIHtcbiAgICAgICAgdGhpcy5fYWRkQ2FsbGJhY2tEYXRhKGFwcENvbnRleHQgfHwge30pO1xuXG4gICAgICAgIGlmIChhcHBDb250ZXh0ICE9PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMuX3N0YXJ0TG9vcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkVycm9yKSB7XG4gICAgICBzdGFydFByb21pc2UuY2F0Y2godGhpcy5wcm9wcy5vbkVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlZHJhdygpIHtcbiAgICBpZiAodGhpcy5pc0NvbnRleHRMb3N0KCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX2JlZ2luVGltZXJzKCk7XG5cbiAgICB0aGlzLl9zZXR1cEZyYW1lKCk7XG5cbiAgICB0aGlzLl91cGRhdGVDYWxsYmFja0RhdGEoKTtcblxuICAgIHRoaXMuX3JlbmRlckZyYW1lKHRoaXMuYW5pbWF0aW9uUHJvcHMpO1xuXG4gICAgdGhpcy5fY2xlYXJOZWVkc1JlZHJhdygpO1xuXG4gICAgaWYgKHRoaXMub2ZmU2NyZWVuICYmIHRoaXMuZ2wuY29tbWl0KSB7XG4gICAgICB0aGlzLmdsLmNvbW1pdCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZXNvbHZlTmV4dEZyYW1lKSB7XG4gICAgICB0aGlzLl9yZXNvbHZlTmV4dEZyYW1lKHRoaXMpO1xuXG4gICAgICB0aGlzLl9uZXh0RnJhbWVQcm9taXNlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2VuZFRpbWVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nKSB7XG4gICAgICB0aGlzLl9maW5hbGl6ZUNhbGxiYWNrRGF0YSgpO1xuXG4gICAgICB0aGlzLl9jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25GcmFtZUlkKTtcblxuICAgICAgdGhpcy5fbmV4dEZyYW1lUHJvbWlzZSA9IG51bGw7XG4gICAgICB0aGlzLl9yZXNvbHZlTmV4dEZyYW1lID0gbnVsbDtcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQgPSBudWxsO1xuICAgICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXR0YWNoVGltZWxpbmUodGltZWxpbmUpIHtcbiAgICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gICAgcmV0dXJuIHRoaXMudGltZWxpbmU7XG4gIH1cblxuICBkZXRhY2hUaW1lbGluZSgpIHtcbiAgICB0aGlzLnRpbWVsaW5lID0gbnVsbDtcbiAgfVxuXG4gIHdhaXRGb3JSZW5kZXIoKSB7XG4gICAgdGhpcy5zZXROZWVkc1JlZHJhdygnd2FpdEZvclJlbmRlcicpO1xuXG4gICAgaWYgKCF0aGlzLl9uZXh0RnJhbWVQcm9taXNlKSB7XG4gICAgICB0aGlzLl9uZXh0RnJhbWVQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUgPSByZXNvbHZlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX25leHRGcmFtZVByb21pc2U7XG4gIH1cblxuICBhc3luYyB0b0RhdGFVUkwoKSB7XG4gICAgdGhpcy5zZXROZWVkc1JlZHJhdygndG9EYXRhVVJMJyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY2FudmFzLnRvRGF0YVVSTCgpO1xuICB9XG5cbiAgaXNDb250ZXh0TG9zdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5pc0NvbnRleHRMb3N0KCk7XG4gIH1cblxuICBvbkNyZWF0ZUNvbnRleHQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ3JlYXRlQ29udGV4dCguLi5hcmdzKTtcbiAgfVxuXG4gIG9uSW5pdGlhbGl6ZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Jbml0aWFsaXplKC4uLmFyZ3MpO1xuICB9XG5cbiAgb25SZW5kZXIoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uUmVuZGVyKC4uLmFyZ3MpO1xuICB9XG5cbiAgb25GaW5hbGl6ZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25GaW5hbGl6ZSguLi5hcmdzKTtcbiAgfVxuXG4gIGdldEhUTUxDb250cm9sVmFsdWUoaWQsIGRlZmF1bHRWYWx1ZSA9IDEpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIHJldHVybiBlbGVtZW50ID8gTnVtYmVyKGVsZW1lbnQudmFsdWUpIDogZGVmYXVsdFZhbHVlO1xuICB9XG5cbiAgc2V0Vmlld1BhcmFtZXRlcnMoKSB7XG4gICAgbG9nLnJlbW92ZWQoJ0FuaW1hdGlvbkxvb3Auc2V0Vmlld1BhcmFtZXRlcnMnLCAnQW5pbWF0aW9uTG9vcC5zZXRQcm9wcycpKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc3RhcnRMb29wKCkge1xuICAgIGNvbnN0IHJlbmRlckZyYW1lID0gKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQgPSB0aGlzLl9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyRnJhbWUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25GcmFtZUlkKTtcblxuICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQgPSB0aGlzLl9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyRnJhbWUpO1xuICB9XG5cbiAgX2dldFBhZ2VMb2FkUHJvbWlzZSgpIHtcbiAgICBpZiAoIXRoaXMuX3BhZ2VMb2FkUHJvbWlzZSkge1xuICAgICAgdGhpcy5fcGFnZUxvYWRQcm9taXNlID0gaXNQYWdlID8gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAoaXNQYWdlICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICByZXNvbHZlKGRvY3VtZW50KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKGRvY3VtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9KSA6IFByb21pc2UucmVzb2x2ZSh7fSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VMb2FkUHJvbWlzZTtcbiAgfVxuXG4gIF9zZXREaXNwbGF5KGRpc3BsYXkpIHtcbiAgICBpZiAodGhpcy5kaXNwbGF5KSB7XG4gICAgICB0aGlzLmRpc3BsYXkuZGVsZXRlKCk7XG4gICAgICB0aGlzLmRpc3BsYXkuYW5pbWF0aW9uTG9vcCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGRpc3BsYXkpIHtcbiAgICAgIGRpc3BsYXkuYW5pbWF0aW9uTG9vcCA9IHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgfVxuXG4gIF9jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUlkKSB7XG4gICAgaWYgKHRoaXMuZGlzcGxheSAmJiB0aGlzLmRpc3BsYXkuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWVJZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lSWQpO1xuICB9XG5cbiAgX3JlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZUNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX3J1bm5pbmcpIHtcbiAgICAgIGlmICh0aGlzLmRpc3BsYXkgJiYgdGhpcy5kaXNwbGF5LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZUNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgX3JlbmRlckZyYW1lKC4uLmFyZ3MpIHtcbiAgICBpZiAodGhpcy5kaXNwbGF5KSB7XG4gICAgICB0aGlzLmRpc3BsYXkuX3JlbmRlckZyYW1lKC4uLmFyZ3MpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vblJlbmRlciguLi5hcmdzKTtcbiAgfVxuXG4gIF9jbGVhck5lZWRzUmVkcmF3KCkge1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSBudWxsO1xuICB9XG5cbiAgX3NldHVwRnJhbWUoKSB7XG4gICAgdGhpcy5fcmVzaXplQ2FudmFzRHJhd2luZ0J1ZmZlcigpO1xuXG4gICAgdGhpcy5fcmVzaXplVmlld3BvcnQoKTtcblxuICAgIHRoaXMuX3Jlc2l6ZUZyYW1lYnVmZmVyKCk7XG4gIH1cblxuICBfaW5pdGlhbGl6ZUNhbGxiYWNrRGF0YSgpIHtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzID0ge1xuICAgICAgZ2w6IHRoaXMuZ2wsXG4gICAgICBzdG9wOiB0aGlzLnN0b3AsXG4gICAgICBjYW52YXM6IHRoaXMuZ2wuY2FudmFzLFxuICAgICAgZnJhbWVidWZmZXI6IHRoaXMuZnJhbWVidWZmZXIsXG4gICAgICB1c2VEZXZpY2VQaXhlbHM6IHRoaXMudXNlRGV2aWNlUGl4ZWxzLFxuICAgICAgbmVlZHNSZWRyYXc6IG51bGwsXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXG4gICAgICBlbmdpbmVUaW1lOiAwLFxuICAgICAgdGljazogMCxcbiAgICAgIHRvY2s6IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgX3RpbWVsaW5lOiB0aGlzLnRpbWVsaW5lLFxuICAgICAgX2xvb3A6IHRoaXMsXG4gICAgICBfYW5pbWF0aW9uTG9vcDogdGhpcyxcbiAgICAgIF9tb3VzZVBvc2l0aW9uOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIF91cGRhdGVDYWxsYmFja0RhdGEoKSB7XG4gICAgY29uc3Qge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBhc3BlY3RcbiAgICB9ID0gdGhpcy5fZ2V0U2l6ZUFuZEFzcGVjdCgpO1xuXG4gICAgaWYgKHdpZHRoICE9PSB0aGlzLmFuaW1hdGlvblByb3BzLndpZHRoIHx8IGhlaWdodCAhPT0gdGhpcy5hbmltYXRpb25Qcm9wcy5oZWlnaHQpIHtcbiAgICAgIHRoaXMuc2V0TmVlZHNSZWRyYXcoJ2RyYXdpbmcgYnVmZmVyIHJlc2l6ZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoYXNwZWN0ICE9PSB0aGlzLmFuaW1hdGlvblByb3BzLmFzcGVjdCkge1xuICAgICAgdGhpcy5zZXROZWVkc1JlZHJhdygnZHJhd2luZyBidWZmZXIgYXNwZWN0IGNoYW5nZWQnKTtcbiAgICB9XG5cbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy5hc3BlY3QgPSBhc3BlY3Q7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy5uZWVkc1JlZHJhdyA9IHRoaXMubmVlZHNSZWRyYXc7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy5lbmdpbmVUaW1lID0gRGF0ZS5ub3coKSAtIHRoaXMuYW5pbWF0aW9uUHJvcHMuc3RhcnRUaW1lO1xuXG4gICAgaWYgKHRoaXMudGltZWxpbmUpIHtcbiAgICAgIHRoaXMudGltZWxpbmUudXBkYXRlKHRoaXMuYW5pbWF0aW9uUHJvcHMuZW5naW5lVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy50aWNrID0gTWF0aC5mbG9vcih0aGlzLmFuaW1hdGlvblByb3BzLnRpbWUgLyAxMDAwICogNjApO1xuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMudG9jaysrO1xuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMudGltZSA9IHRoaXMudGltZWxpbmUgPyB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSA6IHRoaXMuYW5pbWF0aW9uUHJvcHMuZW5naW5lVGltZTtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLl9vZmZTY3JlZW4gPSB0aGlzLm9mZlNjcmVlbjtcbiAgfVxuXG4gIF9maW5hbGl6ZUNhbGxiYWNrRGF0YSgpIHtcbiAgICB0aGlzLm9uRmluYWxpemUodGhpcy5hbmltYXRpb25Qcm9wcyk7XG4gIH1cblxuICBfYWRkQ2FsbGJhY2tEYXRhKGFwcENvbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIGFwcENvbnRleHQgPT09ICdvYmplY3QnICYmIGFwcENvbnRleHQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmFuaW1hdGlvblByb3BzLCBhcHBDb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlV2ViR0xDb250ZXh0KG9wdHMpIHtcbiAgICB0aGlzLm9mZlNjcmVlbiA9IG9wdHMuY2FudmFzICYmIHR5cGVvZiBPZmZzY3JlZW5DYW52YXMgIT09ICd1bmRlZmluZWQnICYmIG9wdHMuY2FudmFzIGluc3RhbmNlb2YgT2Zmc2NyZWVuQ2FudmFzO1xuICAgIG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRzLCB0aGlzLnByb3BzLmdsT3B0aW9ucyk7XG4gICAgdGhpcy5nbCA9IHRoaXMucHJvcHMuZ2wgPyBpbnN0cnVtZW50R0xDb250ZXh0KHRoaXMucHJvcHMuZ2wsIG9wdHMpIDogdGhpcy5vbkNyZWF0ZUNvbnRleHQob3B0cyk7XG5cbiAgICBpZiAoIWlzV2ViR0wodGhpcy5nbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW5pbWF0aW9uTG9vcC5vbkNyZWF0ZUNvbnRleHQgLSBpbGxlZ2FsIGNvbnRleHQgcmV0dXJuZWQnKTtcbiAgICB9XG5cbiAgICByZXNldFBhcmFtZXRlcnModGhpcy5nbCk7XG5cbiAgICB0aGlzLl9jcmVhdGVJbmZvRGl2KCk7XG4gIH1cblxuICBfY3JlYXRlSW5mb0RpdigpIHtcbiAgICBpZiAodGhpcy5nbC5jYW52YXMgJiYgdGhpcy5wcm9wcy5vbkFkZEhUTUwpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQod3JhcHBlckRpdik7XG4gICAgICB3cmFwcGVyRGl2LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gJzEwcHgnO1xuICAgICAgZGl2LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgIGRpdi5zdHlsZS53aWR0aCA9ICczMDBweCc7XG4gICAgICBkaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG4gICAgICB3cmFwcGVyRGl2LmFwcGVuZENoaWxkKHRoaXMuZ2wuY2FudmFzKTtcbiAgICAgIHdyYXBwZXJEaXYuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLnByb3BzLm9uQWRkSFRNTChkaXYpO1xuXG4gICAgICBpZiAoaHRtbCkge1xuICAgICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZ2V0U2l6ZUFuZEFzcGVjdCgpIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICBsZXQgYXNwZWN0ID0gMTtcbiAgICBjb25zdCB7XG4gICAgICBjYW52YXNcbiAgICB9ID0gdGhpcy5nbDtcblxuICAgIGlmIChjYW52YXMgJiYgY2FudmFzLmNsaWVudEhlaWdodCkge1xuICAgICAgYXNwZWN0ID0gY2FudmFzLmNsaWVudFdpZHRoIC8gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICB9IGVsc2UgaWYgKHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwKSB7XG4gICAgICBhc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBhc3BlY3RcbiAgICB9O1xuICB9XG5cbiAgX3Jlc2l6ZVZpZXdwb3J0KCkge1xuICAgIGlmICh0aGlzLmF1dG9SZXNpemVWaWV3cG9ydCkge1xuICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmdsLmRyYXdpbmdCdWZmZXJXaWR0aCwgdGhpcy5nbC5kcmF3aW5nQnVmZmVySGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBfcmVzaXplQ2FudmFzRHJhd2luZ0J1ZmZlcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUmVzaXplRHJhd2luZ0J1ZmZlcikge1xuICAgICAgcmVzaXplR0xDb250ZXh0KHRoaXMuZ2wsIHtcbiAgICAgICAgdXNlRGV2aWNlUGl4ZWxzOiB0aGlzLnVzZURldmljZVBpeGVsc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUZyYW1lYnVmZmVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmNyZWF0ZUZyYW1lYnVmZmVyKSB7XG4gICAgICB0aGlzLmZyYW1lYnVmZmVyID0gbmV3IEZyYW1lYnVmZmVyKHRoaXMuZ2wpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXNpemVGcmFtZWJ1ZmZlcigpIHtcbiAgICBpZiAodGhpcy5mcmFtZWJ1ZmZlcikge1xuICAgICAgdGhpcy5mcmFtZWJ1ZmZlci5yZXNpemUoe1xuICAgICAgICB3aWR0aDogdGhpcy5nbC5kcmF3aW5nQnVmZmVyV2lkdGgsXG4gICAgICAgIGhlaWdodDogdGhpcy5nbC5kcmF3aW5nQnVmZmVySGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfYmVnaW5UaW1lcnMoKSB7XG4gICAgdGhpcy5mcmFtZVJhdGUudGltZUVuZCgpO1xuICAgIHRoaXMuZnJhbWVSYXRlLnRpbWVTdGFydCgpO1xuXG4gICAgaWYgKHRoaXMuX2dwdVRpbWVRdWVyeSAmJiB0aGlzLl9ncHVUaW1lUXVlcnkuaXNSZXN1bHRBdmFpbGFibGUoKSAmJiAhdGhpcy5fZ3B1VGltZVF1ZXJ5LmlzVGltZXJEaXNqb2ludCgpKSB7XG4gICAgICB0aGlzLnN0YXRzLmdldCgnR1BVIFRpbWUnKS5hZGRUaW1lKHRoaXMuX2dwdVRpbWVRdWVyeS5nZXRUaW1lck1pbGxpc2Vjb25kcygpKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZ3B1VGltZVF1ZXJ5KSB7XG4gICAgICB0aGlzLl9ncHVUaW1lUXVlcnkuYmVnaW5UaW1lRWxhcHNlZFF1ZXJ5KCk7XG4gICAgfVxuXG4gICAgdGhpcy5jcHVUaW1lLnRpbWVTdGFydCgpO1xuICB9XG5cbiAgX2VuZFRpbWVycygpIHtcbiAgICB0aGlzLmNwdVRpbWUudGltZUVuZCgpO1xuXG4gICAgaWYgKHRoaXMuX2dwdVRpbWVRdWVyeSkge1xuICAgICAgdGhpcy5fZ3B1VGltZVF1ZXJ5LmVuZCgpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGFydEV2ZW50SGFuZGxpbmcoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2FudmFzXG4gICAgfSA9IHRoaXMuZ2w7XG5cbiAgICBpZiAoY2FudmFzKSB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZW1vdmUpO1xuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9vbk1vdXNlbGVhdmUpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlbW92ZShlKSB7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy5fbW91c2VQb3NpdGlvbiA9IFtlLm9mZnNldFgsIGUub2Zmc2V0WV07XG4gIH1cblxuICBfb25Nb3VzZWxlYXZlKGUpIHtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLl9tb3VzZVBvc2l0aW9uID0gbnVsbDtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbmltYXRpb24tbG9vcC5qcy5tYXAiLCJpbXBvcnQgeyBCdWZmZXIsIGFzc2VydCB9IGZyb20gJ0BsdW1hLmdsL3dlYmdsJztcbmNvbnN0IEdMVEZfVE9fTFVNQV9BVFRSSUJVVEVfTUFQID0ge1xuICBQT1NJVElPTjogJ3Bvc2l0aW9ucycsXG4gIE5PUk1BTDogJ25vcm1hbHMnLFxuICBDT0xPUl8wOiAnY29sb3JzJyxcbiAgVEVYQ09PUkRfMDogJ3RleENvb3JkcycsXG4gIFRFWENPT1JEXzE6ICd0ZXhDb29yZHMxJyxcbiAgVEVYQ09PUkRfMjogJ3RleENvb3JkczInXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1ZmZlcnNGcm9tR2VvbWV0cnkoZ2wsIGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gIGNvbnN0IGJ1ZmZlcnMgPSB7fTtcbiAgbGV0IGluZGljZXMgPSBnZW9tZXRyeS5pbmRpY2VzO1xuXG4gIGZvciAoY29uc3QgbmFtZSBpbiBnZW9tZXRyeS5hdHRyaWJ1dGVzKSB7XG4gICAgY29uc3QgYXR0cmlidXRlID0gZ2VvbWV0cnkuYXR0cmlidXRlc1tuYW1lXTtcbiAgICBjb25zdCByZW1hcHBlZE5hbWUgPSBtYXBBdHRyaWJ1dGVOYW1lKG5hbWUsIG9wdGlvbnMpO1xuXG4gICAgaWYgKG5hbWUgPT09ICdpbmRpY2VzJykge1xuICAgICAgaW5kaWNlcyA9IGF0dHJpYnV0ZTtcbiAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZS5jb25zdGFudCkge1xuICAgICAgYnVmZmVyc1tyZW1hcHBlZE5hbWVdID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlZEFycmF5ID0gYXR0cmlidXRlLnZhbHVlO1xuICAgICAgY29uc3QgYWNjZXNzb3IgPSB7IC4uLmF0dHJpYnV0ZVxuICAgICAgfTtcbiAgICAgIGRlbGV0ZSBhY2Nlc3Nvci52YWx1ZTtcbiAgICAgIGJ1ZmZlcnNbcmVtYXBwZWROYW1lXSA9IFtuZXcgQnVmZmVyKGdsLCB0eXBlZEFycmF5KSwgYWNjZXNzb3JdO1xuICAgICAgaW5mZXJBdHRyaWJ1dGVBY2Nlc3NvcihuYW1lLCBhY2Nlc3Nvcik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGluZGljZXMpIHtcbiAgICBjb25zdCBkYXRhID0gaW5kaWNlcy52YWx1ZSB8fCBpbmRpY2VzO1xuICAgIGFzc2VydChkYXRhIGluc3RhbmNlb2YgVWludDE2QXJyYXkgfHwgZGF0YSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5LCAnYXR0cmlidXRlIGFycmF5IGZvciBcImluZGljZXNcIiBtdXN0IGJlIG9mIGludGVnZXIgdHlwZScpO1xuICAgIGNvbnN0IGFjY2Vzc29yID0ge1xuICAgICAgc2l6ZTogMSxcbiAgICAgIGlzSW5kZXhlZDogaW5kaWNlcy5pc0luZGV4ZWQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpbmRpY2VzLmlzSW5kZXhlZFxuICAgIH07XG4gICAgYnVmZmVycy5pbmRpY2VzID0gW25ldyBCdWZmZXIoZ2wsIHtcbiAgICAgIGRhdGEsXG4gICAgICB0YXJnZXQ6IDM0OTYzXG4gICAgfSksIGFjY2Vzc29yXTtcbiAgfVxuXG4gIHJldHVybiBidWZmZXJzO1xufVxuXG5mdW5jdGlvbiBtYXBBdHRyaWJ1dGVOYW1lKG5hbWUsIG9wdGlvbnMpIHtcbiAgY29uc3Qge1xuICAgIGF0dHJpYnV0ZU1hcCA9IEdMVEZfVE9fTFVNQV9BVFRSSUJVVEVfTUFQXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuICByZXR1cm4gYXR0cmlidXRlTWFwICYmIGF0dHJpYnV0ZU1hcFtuYW1lXSB8fCBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJBdHRyaWJ1dGVBY2Nlc3NvcihhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUpIHtcbiAgbGV0IGNhdGVnb3J5O1xuXG4gIHN3aXRjaCAoYXR0cmlidXRlTmFtZSkge1xuICAgIGNhc2UgJ3RleENvb3Jkcyc6XG4gICAgY2FzZSAndGV4Q29vcmQxJzpcbiAgICBjYXNlICd0ZXhDb29yZDInOlxuICAgIGNhc2UgJ3RleENvb3JkMyc6XG4gICAgICBjYXRlZ29yeSA9ICd1dnMnO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd2ZXJ0aWNlcyc6XG4gICAgY2FzZSAncG9zaXRpb25zJzpcbiAgICBjYXNlICdub3JtYWxzJzpcbiAgICBjYXNlICdwaWNraW5nQ29sb3JzJzpcbiAgICAgIGNhdGVnb3J5ID0gJ3ZlY3RvcnMnO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICB9XG5cbiAgc3dpdGNoIChjYXRlZ29yeSkge1xuICAgIGNhc2UgJ3ZlY3RvcnMnOlxuICAgICAgYXR0cmlidXRlLnNpemUgPSBhdHRyaWJ1dGUuc2l6ZSB8fCAzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd1dnMnOlxuICAgICAgYXR0cmlidXRlLnNpemUgPSBhdHRyaWJ1dGUuc2l6ZSB8fCAyO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICB9XG5cbiAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShhdHRyaWJ1dGUuc2l6ZSksIGBhdHRyaWJ1dGUgJHthdHRyaWJ1dGVOYW1lfSBuZWVkcyBzaXplYCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2RlbC11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBpc1dlYkdMIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgUHJvZ3JhbU1hbmFnZXIgZnJvbSAnLi9wcm9ncmFtLW1hbmFnZXInO1xuaW1wb3J0IHsgUHJvZ3JhbSwgVmVydGV4QXJyYXksIGNsZWFyLCBUcmFuc2Zvcm1GZWVkYmFjaywgQnVmZmVyLCBsb2csIGlzT2JqZWN0RW1wdHksIHVpZCwgYXNzZXJ0IH0gZnJvbSAnQGx1bWEuZ2wvd2ViZ2wnO1xuaW1wb3J0IHsgZ2V0RGVidWdUYWJsZUZvclVuaWZvcm1zLCBnZXREZWJ1Z1RhYmxlRm9yVmVydGV4QXJyYXksIGdldERlYnVnVGFibGVGb3JQcm9ncmFtQ29uZmlndXJhdGlvbiB9IGZyb20gJ0BsdW1hLmdsL3dlYmdsJztcbmltcG9ydCB7IGdldEJ1ZmZlcnNGcm9tR2VvbWV0cnkgfSBmcm9tICcuL21vZGVsLXV0aWxzJztcbmNvbnN0IExPR19EUkFXX1BSSU9SSVRZID0gMjtcbmNvbnN0IExPR19EUkFXX1RJTUVPVVQgPSAxMDAwMDtcbmNvbnN0IEVSUl9NT0RFTF9QQVJBTVMgPSAnTW9kZWwgbmVlZHMgZHJhd01vZGUgYW5kIHZlcnRleENvdW50JztcblxuY29uc3QgTk9PUCA9ICgpID0+IHt9O1xuXG5jb25zdCBEUkFXX1BBUkFNUyA9IHt9O1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGlkID0gdWlkKCdtb2RlbCcpXG4gICAgfSA9IHByb3BzO1xuICAgIGFzc2VydChpc1dlYkdMKGdsKSk7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLmlkID0gcHJvcHMuaWQgfHwgdWlkKCdNb2RlbCcpO1xuICAgIHRoaXMubGFzdExvZ1RpbWUgPSAwO1xuICAgIHRoaXMuYW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB0aGlzLnByb2dyYW1NYW5hZ2VyID0gcHJvcHMucHJvZ3JhbU1hbmFnZXIgfHwgUHJvZ3JhbU1hbmFnZXIuZ2V0RGVmYXVsdFByb2dyYW1NYW5hZ2VyKHRoaXMuZ2wpO1xuICAgIHRoaXMuX3Byb2dyYW1NYW5hZ2VyU3RhdGUgPSAtMTtcbiAgICB0aGlzLl9tYW5hZ2VkUHJvZ3JhbSA9IGZhbHNlO1xuICAgIGNvbnN0IHtcbiAgICAgIHByb2dyYW0gPSBudWxsLFxuICAgICAgdnMsXG4gICAgICBmcyxcbiAgICAgIG1vZHVsZXMsXG4gICAgICBkZWZpbmVzLFxuICAgICAgaW5qZWN0LFxuICAgICAgdmFyeWluZ3MsXG4gICAgICBidWZmZXJNb2RlLFxuICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgfSA9IHByb3BzO1xuICAgIHRoaXMucHJvZ3JhbVByb3BzID0ge1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHZzLFxuICAgICAgZnMsXG4gICAgICBtb2R1bGVzLFxuICAgICAgZGVmaW5lcyxcbiAgICAgIGluamVjdCxcbiAgICAgIHZhcnlpbmdzLFxuICAgICAgYnVmZmVyTW9kZSxcbiAgICAgIHRyYW5zcGlsZVRvR0xTTDEwMFxuICAgIH07XG4gICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB0aGlzLnZlcnRleEFycmF5ID0gbnVsbDtcbiAgICB0aGlzLl9wcm9ncmFtRGlydHkgPSB0cnVlO1xuICAgIHRoaXMudXNlckRhdGEgPSB7fTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICB0aGlzLl9hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy51bmlmb3JtcyA9IHt9O1xuICAgIHRoaXMucGlja2FibGUgPSB0cnVlO1xuXG4gICAgdGhpcy5fY2hlY2tQcm9ncmFtKCk7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0TW9kdWxlVW5pZm9ybXMocHJvcHMubW9kdWxlU2V0dGluZ3MpKSk7XG4gICAgdGhpcy5kcmF3TW9kZSA9IHByb3BzLmRyYXdNb2RlICE9PSB1bmRlZmluZWQgPyBwcm9wcy5kcmF3TW9kZSA6IDQ7XG4gICAgdGhpcy52ZXJ0ZXhDb3VudCA9IHByb3BzLnZlcnRleENvdW50IHx8IDA7XG4gICAgdGhpcy5nZW9tZXRyeUJ1ZmZlcnMgPSB7fTtcbiAgICB0aGlzLmlzSW5zdGFuY2VkID0gcHJvcHMuaXNJbnN0YW5jZWQgfHwgcHJvcHMuaW5zdGFuY2VkIHx8IHByb3BzLmluc3RhbmNlQ291bnQgPiAwO1xuXG4gICAgdGhpcy5fc2V0TW9kZWxQcm9wcyhwcm9wcyk7XG5cbiAgICB0aGlzLmdlb21ldHJ5ID0ge307XG4gICAgYXNzZXJ0KHRoaXMuZHJhd01vZGUgIT09IHVuZGVmaW5lZCAmJiBOdW1iZXIuaXNGaW5pdGUodGhpcy52ZXJ0ZXhDb3VudCksIEVSUl9NT0RFTF9QQVJBTVMpO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICB0aGlzLl9zZXRNb2RlbFByb3BzKHByb3BzKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9hdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAodGhpcy5fYXR0cmlidXRlc1trZXldICE9PSB0aGlzLmF0dHJpYnV0ZXNba2V5XSkge1xuICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzW2tleV0uZGVsZXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21hbmFnZWRQcm9ncmFtKSB7XG4gICAgICB0aGlzLnByb2dyYW1NYW5hZ2VyLnJlbGVhc2UodGhpcy5wcm9ncmFtKTtcbiAgICAgIHRoaXMuX21hbmFnZWRQcm9ncmFtID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy52ZXJ0ZXhBcnJheS5kZWxldGUoKTtcblxuICAgIHRoaXMuX2RlbGV0ZUdlb21ldHJ5QnVmZmVycygpO1xuICB9XG5cbiAgZ2V0RHJhd01vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZHJhd01vZGU7XG4gIH1cblxuICBnZXRWZXJ0ZXhDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJ0ZXhDb3VudDtcbiAgfVxuXG4gIGdldEluc3RhbmNlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VDb3VudDtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcztcbiAgfVxuXG4gIGdldFByb2dyYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvZ3JhbTtcbiAgfVxuXG4gIHNldFByb2dyYW0ocHJvcHMpIHtcbiAgICBjb25zdCB7XG4gICAgICBwcm9ncmFtLFxuICAgICAgdnMsXG4gICAgICBmcyxcbiAgICAgIG1vZHVsZXMsXG4gICAgICBkZWZpbmVzLFxuICAgICAgaW5qZWN0LFxuICAgICAgdmFyeWluZ3MsXG4gICAgICBidWZmZXJNb2RlLFxuICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgfSA9IHByb3BzO1xuICAgIHRoaXMucHJvZ3JhbVByb3BzID0ge1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHZzLFxuICAgICAgZnMsXG4gICAgICBtb2R1bGVzLFxuICAgICAgZGVmaW5lcyxcbiAgICAgIGluamVjdCxcbiAgICAgIHZhcnlpbmdzLFxuICAgICAgYnVmZmVyTW9kZSxcbiAgICAgIHRyYW5zcGlsZVRvR0xTTDEwMFxuICAgIH07XG4gICAgdGhpcy5fcHJvZ3JhbURpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFVuaWZvcm1zKCkge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zO1xuICB9XG5cbiAgc2V0RHJhd01vZGUoZHJhd01vZGUpIHtcbiAgICB0aGlzLmRyYXdNb2RlID0gZHJhd01vZGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRWZXJ0ZXhDb3VudCh2ZXJ0ZXhDb3VudCkge1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUodmVydGV4Q291bnQpKTtcbiAgICB0aGlzLnZlcnRleENvdW50ID0gdmVydGV4Q291bnQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRJbnN0YW5jZUNvdW50KGluc3RhbmNlQ291bnQpIHtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGluc3RhbmNlQ291bnQpKTtcbiAgICB0aGlzLmluc3RhbmNlQ291bnQgPSBpbnN0YW5jZUNvdW50O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0R2VvbWV0cnkoZ2VvbWV0cnkpIHtcbiAgICB0aGlzLmRyYXdNb2RlID0gZ2VvbWV0cnkuZHJhd01vZGU7XG4gICAgdGhpcy52ZXJ0ZXhDb3VudCA9IGdlb21ldHJ5LmdldFZlcnRleENvdW50KCk7XG5cbiAgICB0aGlzLl9kZWxldGVHZW9tZXRyeUJ1ZmZlcnMoKTtcblxuICAgIHRoaXMuZ2VvbWV0cnlCdWZmZXJzID0gZ2V0QnVmZmVyc0Zyb21HZW9tZXRyeSh0aGlzLmdsLCBnZW9tZXRyeSk7XG4gICAgdGhpcy52ZXJ0ZXhBcnJheS5zZXRBdHRyaWJ1dGVzKHRoaXMuZ2VvbWV0cnlCdWZmZXJzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgaWYgKGlzT2JqZWN0RW1wdHkoYXR0cmlidXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRBdHRyaWJ1dGVzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgIG5vcm1hbGl6ZWRBdHRyaWJ1dGVzW25hbWVdID0gYXR0cmlidXRlLmdldFZhbHVlID8gYXR0cmlidXRlLmdldFZhbHVlKCkgOiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgdGhpcy52ZXJ0ZXhBcnJheS5zZXRBdHRyaWJ1dGVzKG5vcm1hbGl6ZWRBdHRyaWJ1dGVzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFVuaWZvcm1zKHVuaWZvcm1zID0ge30pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMudW5pZm9ybXMsIHVuaWZvcm1zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldE1vZHVsZVVuaWZvcm1zKG9wdHMpIHtcbiAgICB0aGlzLl9jaGVja1Byb2dyYW0oKTtcblxuICAgIGNvbnN0IGdldFVuaWZvcm1zID0gdGhpcy5wcm9ncmFtTWFuYWdlci5nZXRVbmlmb3Jtcyh0aGlzLnByb2dyYW0pO1xuXG4gICAgaWYgKGdldFVuaWZvcm1zKSB7XG4gICAgICByZXR1cm4gZ2V0VW5pZm9ybXMob3B0cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgdXBkYXRlTW9kdWxlU2V0dGluZ3Mob3B0cykge1xuICAgIGNvbnN0IHVuaWZvcm1zID0gdGhpcy5nZXRNb2R1bGVVbmlmb3JtcyhvcHRzIHx8IHt9KTtcbiAgICByZXR1cm4gdGhpcy5zZXRVbmlmb3Jtcyh1bmlmb3Jtcyk7XG4gIH1cblxuICBjbGVhcihvcHRzKSB7XG4gICAgY2xlYXIodGhpcy5wcm9ncmFtLmdsLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRyYXcob3B0cyA9IHt9KSB7XG4gICAgdGhpcy5fY2hlY2tQcm9ncmFtKCk7XG5cbiAgICBjb25zdCB7XG4gICAgICBtb2R1bGVTZXR0aW5ncyA9IG51bGwsXG4gICAgICBmcmFtZWJ1ZmZlcixcbiAgICAgIHVuaWZvcm1zID0ge30sXG4gICAgICBhdHRyaWJ1dGVzID0ge30sXG4gICAgICB0cmFuc2Zvcm1GZWVkYmFjayA9IHRoaXMudHJhbnNmb3JtRmVlZGJhY2ssXG4gICAgICBwYXJhbWV0ZXJzID0ge30sXG4gICAgICB2ZXJ0ZXhBcnJheSA9IHRoaXMudmVydGV4QXJyYXlcbiAgICB9ID0gb3B0cztcbiAgICB0aGlzLnNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gICAgdGhpcy51cGRhdGVNb2R1bGVTZXR0aW5ncyhtb2R1bGVTZXR0aW5ncyk7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh1bmlmb3Jtcyk7XG4gICAgbGV0IGxvZ1ByaW9yaXR5O1xuXG4gICAgaWYgKGxvZy5wcmlvcml0eSA+PSBMT0dfRFJBV19QUklPUklUWSkge1xuICAgICAgbG9nUHJpb3JpdHkgPSB0aGlzLl9sb2dEcmF3Q2FsbFN0YXJ0KExPR19EUkFXX1BSSU9SSVRZKTtcbiAgICB9XG5cbiAgICBjb25zdCBkcmF3UGFyYW1zID0gdGhpcy52ZXJ0ZXhBcnJheS5nZXREcmF3UGFyYW1zKCk7XG4gICAgY29uc3Qge1xuICAgICAgaXNJbmRleGVkID0gZHJhd1BhcmFtcy5pc0luZGV4ZWQsXG4gICAgICBpbmRleFR5cGUgPSBkcmF3UGFyYW1zLmluZGV4VHlwZSxcbiAgICAgIGluZGV4T2Zmc2V0ID0gZHJhd1BhcmFtcy5pbmRleE9mZnNldCxcbiAgICAgIHZlcnRleEFycmF5SW5zdGFuY2VkID0gZHJhd1BhcmFtcy5pc0luc3RhbmNlZFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKHZlcnRleEFycmF5SW5zdGFuY2VkICYmICF0aGlzLmlzSW5zdGFuY2VkKSB7XG4gICAgICBsb2cud2FybignRm91bmQgaW5zdGFuY2VkIGF0dHJpYnV0ZXMgb24gbm9uLWluc3RhbmNlZCBtb2RlbCcsIHRoaXMuaWQpKCk7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgaXNJbnN0YW5jZWQsXG4gICAgICBpbnN0YW5jZUNvdW50XG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3Qge1xuICAgICAgb25CZWZvcmVSZW5kZXIgPSBOT09QLFxuICAgICAgb25BZnRlclJlbmRlciA9IE5PT1BcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBvbkJlZm9yZVJlbmRlcigpO1xuICAgIHRoaXMucHJvZ3JhbS5zZXRVbmlmb3Jtcyh0aGlzLnVuaWZvcm1zKTtcbiAgICBjb25zdCBkaWREcmF3ID0gdGhpcy5wcm9ncmFtLmRyYXcoT2JqZWN0LmFzc2lnbihEUkFXX1BBUkFNUywgb3B0cywge1xuICAgICAgbG9nUHJpb3JpdHksXG4gICAgICB1bmlmb3JtczogbnVsbCxcbiAgICAgIGZyYW1lYnVmZmVyLFxuICAgICAgcGFyYW1ldGVycyxcbiAgICAgIGRyYXdNb2RlOiB0aGlzLmdldERyYXdNb2RlKCksXG4gICAgICB2ZXJ0ZXhDb3VudDogdGhpcy5nZXRWZXJ0ZXhDb3VudCgpLFxuICAgICAgdmVydGV4QXJyYXksXG4gICAgICB0cmFuc2Zvcm1GZWVkYmFjayxcbiAgICAgIGlzSW5kZXhlZCxcbiAgICAgIGluZGV4VHlwZSxcbiAgICAgIGlzSW5zdGFuY2VkLFxuICAgICAgaW5zdGFuY2VDb3VudCxcbiAgICAgIG9mZnNldDogaXNJbmRleGVkID8gaW5kZXhPZmZzZXQgOiAwXG4gICAgfSkpO1xuICAgIG9uQWZ0ZXJSZW5kZXIoKTtcblxuICAgIGlmIChsb2cucHJpb3JpdHkgPj0gTE9HX0RSQVdfUFJJT1JJVFkpIHtcbiAgICAgIHRoaXMuX2xvZ0RyYXdDYWxsRW5kKGxvZ1ByaW9yaXR5LCB2ZXJ0ZXhBcnJheSwgZnJhbWVidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBkaWREcmF3O1xuICB9XG5cbiAgdHJhbnNmb3JtKG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGRpc2NhcmQgPSB0cnVlLFxuICAgICAgZmVlZGJhY2tCdWZmZXJzLFxuICAgICAgdW5iaW5kTW9kZWxzID0gW11cbiAgICB9ID0gb3B0cztcbiAgICBsZXQge1xuICAgICAgcGFyYW1ldGVyc1xuICAgIH0gPSBvcHRzO1xuXG4gICAgaWYgKGZlZWRiYWNrQnVmZmVycykge1xuICAgICAgdGhpcy5fc2V0RmVlZGJhY2tCdWZmZXJzKGZlZWRiYWNrQnVmZmVycyk7XG4gICAgfVxuXG4gICAgaWYgKGRpc2NhcmQpIHtcbiAgICAgIHBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBwYXJhbWV0ZXJzLCB7XG4gICAgICAgIFszNTk3N106IGRpc2NhcmRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHVuYmluZE1vZGVscy5mb3JFYWNoKG1vZGVsID0+IG1vZGVsLnZlcnRleEFycmF5LnVuYmluZEJ1ZmZlcnMoKSk7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5kcmF3KE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgICAgcGFyYW1ldGVyc1xuICAgICAgfSkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB1bmJpbmRNb2RlbHMuZm9yRWFjaChtb2RlbCA9PiBtb2RlbC52ZXJ0ZXhBcnJheS5iaW5kQnVmZmVycygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbmRlcih1bmlmb3JtcyA9IHt9KSB7XG4gICAgbG9nLndhcm4oJ01vZGVsLnJlbmRlcigpIGlzIGRlcHJlY2F0ZWQuIFVzZSBNb2RlbC5zZXRVbmlmb3JtcygpIGFuZCBNb2RlbC5kcmF3KCknKSgpO1xuICAgIHJldHVybiB0aGlzLnNldFVuaWZvcm1zKHVuaWZvcm1zKS5kcmF3KCk7XG4gIH1cblxuICBfc2V0TW9kZWxQcm9wcyhwcm9wcykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5wcm9wcywgcHJvcHMpO1xuXG4gICAgaWYgKCd1bmlmb3JtcycgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuc2V0VW5pZm9ybXMocHJvcHMudW5pZm9ybXMpO1xuICAgIH1cblxuICAgIGlmICgncGlja2FibGUnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnBpY2thYmxlID0gcHJvcHMucGlja2FibGU7XG4gICAgfVxuXG4gICAgaWYgKCdpbnN0YW5jZUNvdW50JyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5pbnN0YW5jZUNvdW50ID0gcHJvcHMuaW5zdGFuY2VDb3VudDtcbiAgICB9XG5cbiAgICBpZiAoJ2dlb21ldHJ5JyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRHZW9tZXRyeShwcm9wcy5nZW9tZXRyeSk7XG4gICAgfVxuXG4gICAgaWYgKCdhdHRyaWJ1dGVzJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVzKHByb3BzLmF0dHJpYnV0ZXMpO1xuICAgIH1cblxuICAgIGlmICgnX2ZlZWRiYWNrQnVmZmVycycgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuX3NldEZlZWRiYWNrQnVmZmVycyhwcm9wcy5fZmVlZGJhY2tCdWZmZXJzKTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tQcm9ncmFtKCkge1xuICAgIGNvbnN0IG5lZWRzVXBkYXRlID0gdGhpcy5fcHJvZ3JhbURpcnR5IHx8IHRoaXMucHJvZ3JhbU1hbmFnZXIuc3RhdGVIYXNoICE9PSB0aGlzLl9wcm9ncmFtTWFuYWdlclN0YXRlO1xuXG4gICAgaWYgKCFuZWVkc1VwZGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB7XG4gICAgICBwcm9ncmFtXG4gICAgfSA9IHRoaXMucHJvZ3JhbVByb3BzO1xuXG4gICAgaWYgKHByb2dyYW0pIHtcbiAgICAgIHRoaXMuX21hbmFnZWRQcm9ncmFtID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdnMsXG4gICAgICAgIGZzLFxuICAgICAgICBtb2R1bGVzLFxuICAgICAgICBpbmplY3QsXG4gICAgICAgIGRlZmluZXMsXG4gICAgICAgIHZhcnlpbmdzLFxuICAgICAgICBidWZmZXJNb2RlLFxuICAgICAgICB0cmFuc3BpbGVUb0dMU0wxMDBcbiAgICAgIH0gPSB0aGlzLnByb2dyYW1Qcm9wcztcbiAgICAgIHByb2dyYW0gPSB0aGlzLnByb2dyYW1NYW5hZ2VyLmdldCh7XG4gICAgICAgIHZzLFxuICAgICAgICBmcyxcbiAgICAgICAgbW9kdWxlcyxcbiAgICAgICAgaW5qZWN0LFxuICAgICAgICBkZWZpbmVzLFxuICAgICAgICB2YXJ5aW5ncyxcbiAgICAgICAgYnVmZmVyTW9kZSxcbiAgICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMucHJvZ3JhbSAmJiB0aGlzLl9tYW5hZ2VkUHJvZ3JhbSkge1xuICAgICAgICB0aGlzLnByb2dyYW1NYW5hZ2VyLnJlbGVhc2UodGhpcy5wcm9ncmFtKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcHJvZ3JhbU1hbmFnZXJTdGF0ZSA9IHRoaXMucHJvZ3JhbU1hbmFnZXIuc3RhdGVIYXNoO1xuICAgICAgdGhpcy5fbWFuYWdlZFByb2dyYW0gPSB0cnVlO1xuICAgIH1cblxuICAgIGFzc2VydChwcm9ncmFtIGluc3RhbmNlb2YgUHJvZ3JhbSwgJ01vZGVsIG5lZWRzIGEgcHJvZ3JhbScpO1xuICAgIHRoaXMuX3Byb2dyYW1EaXJ0eSA9IGZhbHNlO1xuXG4gICAgaWYgKHByb2dyYW0gPT09IHRoaXMucHJvZ3JhbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG5cbiAgICBpZiAodGhpcy52ZXJ0ZXhBcnJheSkge1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheS5zZXRQcm9wcyh7XG4gICAgICAgIHByb2dyYW06IHRoaXMucHJvZ3JhbSxcbiAgICAgICAgYXR0cmlidXRlczogdGhpcy52ZXJ0ZXhBcnJheS5hdHRyaWJ1dGVzXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheSA9IG5ldyBWZXJ0ZXhBcnJheSh0aGlzLmdsLCB7XG4gICAgICAgIHByb2dyYW06IHRoaXMucHJvZ3JhbVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRVbmlmb3JtcyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldE1vZHVsZVVuaWZvcm1zKCkpKTtcbiAgfVxuXG4gIF9kZWxldGVHZW9tZXRyeUJ1ZmZlcnMoKSB7XG4gICAgZm9yIChjb25zdCBuYW1lIGluIHRoaXMuZ2VvbWV0cnlCdWZmZXJzKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSB0aGlzLmdlb21ldHJ5QnVmZmVyc1tuYW1lXVswXSB8fCB0aGlzLmdlb21ldHJ5QnVmZmVyc1tuYW1lXTtcblxuICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICBidWZmZXIuZGVsZXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NldEFuaW1hdGlvblByb3BzKGFuaW1hdGlvblByb3BzKSB7XG4gICAgaWYgKHRoaXMuYW5pbWF0ZWQpIHtcbiAgICAgIGFzc2VydChhbmltYXRpb25Qcm9wcywgJ01vZGVsLmRyYXcoKTogYW5pbWF0ZWQgdW5pZm9ybXMgYnV0IG5vIGFuaW1hdGlvblByb3BzJyk7XG4gICAgfVxuICB9XG5cbiAgX3NldEZlZWRiYWNrQnVmZmVycyhmZWVkYmFja0J1ZmZlcnMgPSB7fSkge1xuICAgIGlmIChpc09iamVjdEVtcHR5KGZlZWRiYWNrQnVmZmVycykpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXMucHJvZ3JhbTtcbiAgICB0aGlzLnRyYW5zZm9ybUZlZWRiYWNrID0gdGhpcy50cmFuc2Zvcm1GZWVkYmFjayB8fCBuZXcgVHJhbnNmb3JtRmVlZGJhY2soZ2wsIHtcbiAgICAgIHByb2dyYW06IHRoaXMucHJvZ3JhbVxuICAgIH0pO1xuICAgIHRoaXMudHJhbnNmb3JtRmVlZGJhY2suc2V0QnVmZmVycyhmZWVkYmFja0J1ZmZlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2xvZ0RyYXdDYWxsU3RhcnQobG9nTGV2ZWwpIHtcbiAgICBjb25zdCBsb2dEcmF3VGltZW91dCA9IGxvZ0xldmVsID4gMyA/IDAgOiBMT0dfRFJBV19USU1FT1VUO1xuXG4gICAgaWYgKERhdGUubm93KCkgLSB0aGlzLmxhc3RMb2dUaW1lIDwgbG9nRHJhd1RpbWVvdXQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0TG9nVGltZSA9IERhdGUubm93KCk7XG4gICAgbG9nLmdyb3VwKExPR19EUkFXX1BSSU9SSVRZLCBgPj4+IERSQVdJTkcgTU9ERUwgJHt0aGlzLmlkfWAsIHtcbiAgICAgIGNvbGxhcHNlZDogbG9nLmxldmVsIDw9IDJcbiAgICB9KSgpO1xuICAgIHJldHVybiBsb2dMZXZlbDtcbiAgfVxuXG4gIF9sb2dEcmF3Q2FsbEVuZChsb2dMZXZlbCwgdmVydGV4QXJyYXksIHVuaWZvcm1zLCBmcmFtZWJ1ZmZlcikge1xuICAgIGlmIChsb2dMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYXR0cmlidXRlVGFibGUgPSBnZXREZWJ1Z1RhYmxlRm9yVmVydGV4QXJyYXkoe1xuICAgICAgdmVydGV4QXJyYXksXG4gICAgICBoZWFkZXI6IGAke3RoaXMuaWR9IGF0dHJpYnV0ZXNgLFxuICAgICAgYXR0cmlidXRlczogdGhpcy5fYXR0cmlidXRlc1xuICAgIH0pO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlOiB1bmlmb3JtVGFibGUsXG4gICAgICB1bnVzZWRUYWJsZSxcbiAgICAgIHVudXNlZENvdW50XG4gICAgfSA9IGdldERlYnVnVGFibGVGb3JVbmlmb3Jtcyh7XG4gICAgICBoZWFkZXI6IGAke3RoaXMuaWR9IHVuaWZvcm1zYCxcbiAgICAgIHByb2dyYW06IHRoaXMucHJvZ3JhbSxcbiAgICAgIHVuaWZvcm1zOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb2dyYW0udW5pZm9ybXMsIHVuaWZvcm1zKVxuICAgIH0pO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlOiBtaXNzaW5nVGFibGUsXG4gICAgICBjb3VudDogbWlzc2luZ0NvdW50XG4gICAgfSA9IGdldERlYnVnVGFibGVGb3JVbmlmb3Jtcyh7XG4gICAgICBoZWFkZXI6IGAke3RoaXMuaWR9IHVuaWZvcm1zYCxcbiAgICAgIHByb2dyYW06IHRoaXMucHJvZ3JhbSxcbiAgICAgIHVuaWZvcm1zOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb2dyYW0udW5pZm9ybXMsIHVuaWZvcm1zKSxcbiAgICAgIHVuZGVmaW5lZE9ubHk6IHRydWVcbiAgICB9KTtcblxuICAgIGlmIChtaXNzaW5nQ291bnQgPiAwKSB7XG4gICAgICBsb2cubG9nKCdNSVNTSU5HIFVOSUZPUk1TJywgT2JqZWN0LmtleXMobWlzc2luZ1RhYmxlKSkoKTtcbiAgICB9XG5cbiAgICBpZiAodW51c2VkQ291bnQgPiAwKSB7XG4gICAgICBsb2cubG9nKCdVTlVTRUQgVU5JRk9STVMnLCBPYmplY3Qua2V5cyh1bnVzZWRUYWJsZSkpKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnVGFibGUgPSBnZXREZWJ1Z1RhYmxlRm9yUHJvZ3JhbUNvbmZpZ3VyYXRpb24odGhpcy52ZXJ0ZXhBcnJheS5jb25maWd1cmF0aW9uKTtcbiAgICBsb2cudGFibGUobG9nTGV2ZWwsIGF0dHJpYnV0ZVRhYmxlKSgpO1xuICAgIGxvZy50YWJsZShsb2dMZXZlbCwgdW5pZm9ybVRhYmxlKSgpO1xuICAgIGxvZy50YWJsZShsb2dMZXZlbCArIDEsIGNvbmZpZ1RhYmxlKSgpO1xuXG4gICAgaWYgKGZyYW1lYnVmZmVyKSB7XG4gICAgICBmcmFtZWJ1ZmZlci5sb2coe1xuICAgICAgICBsb2dMZXZlbDogTE9HX0RSQVdfUFJJT1JJVFksXG4gICAgICAgIG1lc3NhZ2U6IGBSZW5kZXJlZCB0byAke2ZyYW1lYnVmZmVyLmlkfWBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxvZy5ncm91cEVuZChMT0dfRFJBV19QUklPUklUWSwgYD4+PiBEUkFXSU5HIE1PREVMICR7dGhpcy5pZH1gKSgpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZGVsLmpzLm1hcCIsImltcG9ydCB7IGFzc2VtYmxlU2hhZGVycyB9IGZyb20gJ0BsdW1hLmdsL3NoYWRlcnRvb2xzJztcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICdAbHVtYS5nbC93ZWJnbCc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9ncmFtTWFuYWdlciB7XG4gIHN0YXRpYyBnZXREZWZhdWx0UHJvZ3JhbU1hbmFnZXIoZ2wpIHtcbiAgICBnbC5sdW1hID0gZ2wubHVtYSB8fCB7fTtcbiAgICBnbC5sdW1hLmRlZmF1bHRQcm9ncmFtTWFuYWdlciA9IGdsLmx1bWEuZGVmYXVsdFByb2dyYW1NYW5hZ2VyIHx8IG5ldyBQcm9ncmFtTWFuYWdlcihnbCk7XG4gICAgcmV0dXJuIGdsLmx1bWEuZGVmYXVsdFByb2dyYW1NYW5hZ2VyO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wpIHtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5fcHJvZ3JhbUNhY2hlID0ge307XG4gICAgdGhpcy5fZ2V0VW5pZm9ybXMgPSB7fTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkTW9kdWxlcyA9IHt9O1xuICAgIHRoaXMuX2hvb2tGdW5jdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9kZWZhdWx0TW9kdWxlcyA9IFtdO1xuICAgIHRoaXMuX2hhc2hlcyA9IHt9O1xuICAgIHRoaXMuX2hhc2hDb3VudGVyID0gMDtcbiAgICB0aGlzLnN0YXRlSGFzaCA9IDA7XG4gICAgdGhpcy5fdXNlQ291bnRzID0ge307XG4gIH1cblxuICBhZGREZWZhdWx0TW9kdWxlKG1vZHVsZSkge1xuICAgIGlmICghdGhpcy5fZGVmYXVsdE1vZHVsZXMuZmluZChtID0+IG0ubmFtZSA9PT0gbW9kdWxlLm5hbWUpKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0TW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZUhhc2grKztcbiAgfVxuXG4gIHJlbW92ZURlZmF1bHRNb2R1bGUobW9kdWxlKSB7XG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IHR5cGVvZiBtb2R1bGUgPT09ICdzdHJpbmcnID8gbW9kdWxlIDogbW9kdWxlLm5hbWU7XG4gICAgdGhpcy5fZGVmYXVsdE1vZHVsZXMgPSB0aGlzLl9kZWZhdWx0TW9kdWxlcy5maWx0ZXIobSA9PiBtLm5hbWUgIT09IG1vZHVsZU5hbWUpO1xuICAgIHRoaXMuc3RhdGVIYXNoKys7XG4gIH1cblxuICBhZGRTaGFkZXJIb29rKGhvb2ssIG9wdHMpIHtcbiAgICBpZiAob3B0cykge1xuICAgICAgaG9vayA9IE9iamVjdC5hc3NpZ24ob3B0cywge1xuICAgICAgICBob29rXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9ob29rRnVuY3Rpb25zLnB1c2goaG9vayk7XG5cbiAgICB0aGlzLnN0YXRlSGFzaCsrO1xuICB9XG5cbiAgZ2V0KHByb3BzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICB2cyA9ICcnLFxuICAgICAgZnMgPSAnJyxcbiAgICAgIGRlZmluZXMgPSB7fSxcbiAgICAgIGluamVjdCA9IHt9LFxuICAgICAgdmFyeWluZ3MgPSBbXSxcbiAgICAgIGJ1ZmZlck1vZGUgPSAweDhjOGQsXG4gICAgICB0cmFuc3BpbGVUb0dMU0wxMDAgPSBmYWxzZVxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IG1vZHVsZXMgPSB0aGlzLl9nZXRNb2R1bGVMaXN0KHByb3BzLm1vZHVsZXMpO1xuXG4gICAgY29uc3QgdnNIYXNoID0gdGhpcy5fZ2V0SGFzaCh2cyk7XG5cbiAgICBjb25zdCBmc0hhc2ggPSB0aGlzLl9nZXRIYXNoKGZzKTtcblxuICAgIGNvbnN0IG1vZHVsZUhhc2hlcyA9IG1vZHVsZXMubWFwKG0gPT4gdGhpcy5fZ2V0SGFzaChtLm5hbWUpKS5zb3J0KCk7XG4gICAgY29uc3QgdmFyeWluZ0hhc2hlcyA9IHZhcnlpbmdzLm1hcCh2ID0+IHRoaXMuX2dldEhhc2godikpO1xuICAgIGNvbnN0IGRlZmluZUtleXMgPSBPYmplY3Qua2V5cyhkZWZpbmVzKS5zb3J0KCk7XG4gICAgY29uc3QgaW5qZWN0S2V5cyA9IE9iamVjdC5rZXlzKGluamVjdCkuc29ydCgpO1xuICAgIGNvbnN0IGRlZmluZUhhc2hlcyA9IFtdO1xuICAgIGNvbnN0IGluamVjdEhhc2hlcyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgZGVmaW5lS2V5cykge1xuICAgICAgZGVmaW5lSGFzaGVzLnB1c2godGhpcy5fZ2V0SGFzaChrZXkpKTtcbiAgICAgIGRlZmluZUhhc2hlcy5wdXNoKHRoaXMuX2dldEhhc2goZGVmaW5lc1trZXldKSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgaW5qZWN0S2V5cykge1xuICAgICAgaW5qZWN0SGFzaGVzLnB1c2godGhpcy5fZ2V0SGFzaChrZXkpKTtcbiAgICAgIGluamVjdEhhc2hlcy5wdXNoKHRoaXMuX2dldEhhc2goaW5qZWN0W2tleV0pKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoID0gYCR7dnNIYXNofS8ke2ZzSGFzaH1EJHtkZWZpbmVIYXNoZXMuam9pbignLycpfU0ke21vZHVsZUhhc2hlcy5qb2luKCcvJyl9SSR7aW5qZWN0SGFzaGVzLmpvaW4oJy8nKX1WJHt2YXJ5aW5nSGFzaGVzLmpvaW4oJy8nKX1IJHt0aGlzLnN0YXRlSGFzaH1CJHtidWZmZXJNb2RlfSR7dHJhbnNwaWxlVG9HTFNMMTAwID8gJ1QnIDogJyd9YDtcblxuICAgIGlmICghdGhpcy5fcHJvZ3JhbUNhY2hlW2hhc2hdKSB7XG4gICAgICBjb25zdCBhc3NlbWJsZWQgPSBhc3NlbWJsZVNoYWRlcnModGhpcy5nbCwge1xuICAgICAgICB2cyxcbiAgICAgICAgZnMsXG4gICAgICAgIG1vZHVsZXMsXG4gICAgICAgIGluamVjdCxcbiAgICAgICAgZGVmaW5lcyxcbiAgICAgICAgaG9va0Z1bmN0aW9uczogdGhpcy5faG9va0Z1bmN0aW9ucyxcbiAgICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3Byb2dyYW1DYWNoZVtoYXNoXSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHtcbiAgICAgICAgaGFzaCxcbiAgICAgICAgdnM6IGFzc2VtYmxlZC52cyxcbiAgICAgICAgZnM6IGFzc2VtYmxlZC5mcyxcbiAgICAgICAgdmFyeWluZ3MsXG4gICAgICAgIGJ1ZmZlck1vZGVcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9nZXRVbmlmb3Jtc1toYXNoXSA9IGFzc2VtYmxlZC5nZXRVbmlmb3JtcyB8fCAoeCA9PiB7fSk7XG5cbiAgICAgIHRoaXMuX3VzZUNvdW50c1toYXNoXSA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5fdXNlQ291bnRzW2hhc2hdKys7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2dyYW1DYWNoZVtoYXNoXTtcbiAgfVxuXG4gIGdldFVuaWZvcm1zKHByb2dyYW0pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VW5pZm9ybXNbcHJvZ3JhbS5oYXNoXSB8fCBudWxsO1xuICB9XG5cbiAgcmVsZWFzZShwcm9ncmFtKSB7XG4gICAgY29uc3QgaGFzaCA9IHByb2dyYW0uaGFzaDtcbiAgICB0aGlzLl91c2VDb3VudHNbaGFzaF0tLTtcblxuICAgIGlmICh0aGlzLl91c2VDb3VudHNbaGFzaF0gPT09IDApIHtcbiAgICAgIHRoaXMuX3Byb2dyYW1DYWNoZVtoYXNoXS5kZWxldGUoKTtcblxuICAgICAgZGVsZXRlIHRoaXMuX3Byb2dyYW1DYWNoZVtoYXNoXTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9nZXRVbmlmb3Jtc1toYXNoXTtcbiAgICAgIGRlbGV0ZSB0aGlzLl91c2VDb3VudHNbaGFzaF07XG4gICAgfVxuICB9XG5cbiAgX2dldEhhc2goa2V5KSB7XG4gICAgaWYgKHRoaXMuX2hhc2hlc1trZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2hhc2hlc1trZXldID0gdGhpcy5faGFzaENvdW50ZXIrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faGFzaGVzW2tleV07XG4gIH1cblxuICBfZ2V0TW9kdWxlTGlzdChhcHBNb2R1bGVzID0gW10pIHtcbiAgICBjb25zdCBtb2R1bGVzID0gbmV3IEFycmF5KHRoaXMuX2RlZmF1bHRNb2R1bGVzLmxlbmd0aCArIGFwcE1vZHVsZXMubGVuZ3RoKTtcbiAgICBjb25zdCBzZWVuID0ge307XG4gICAgbGV0IGNvdW50ID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLl9kZWZhdWx0TW9kdWxlcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY29uc3QgbW9kdWxlID0gdGhpcy5fZGVmYXVsdE1vZHVsZXNbaV07XG4gICAgICBjb25zdCBuYW1lID0gbW9kdWxlLm5hbWU7XG4gICAgICBtb2R1bGVzW2NvdW50KytdID0gbW9kdWxlO1xuICAgICAgc2VlbltuYW1lXSA9IHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFwcE1vZHVsZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNvbnN0IG1vZHVsZSA9IGFwcE1vZHVsZXNbaV07XG4gICAgICBjb25zdCBuYW1lID0gbW9kdWxlLm5hbWU7XG5cbiAgICAgIGlmICghc2VlbltuYW1lXSkge1xuICAgICAgICBtb2R1bGVzW2NvdW50KytdID0gbW9kdWxlO1xuICAgICAgICBzZWVuW25hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtb2R1bGVzLmxlbmd0aCA9IGNvdW50O1xuICAgIHJldHVybiBtb2R1bGVzO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb2dyYW0tbWFuYWdlci5qcy5tYXAiLCJpbXBvcnQgeyBnbG9iYWwsIGlzQnJvd3NlciBhcyBnZXRJc0Jyb3dzZXIgfSBmcm9tICdwcm9iZS5nbC9lbnYnO1xuaW1wb3J0IHsgdHJhY2tDb250ZXh0U3RhdGUgfSBmcm9tICcuLi9zdGF0ZS10cmFja2VyL3RyYWNrLWNvbnRleHQtc3RhdGUnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBnZXREZXZpY2VQaXhlbFJhdGlvIH0gZnJvbSAnLi4vdXRpbHMvZGV2aWNlLXBpeGVscyc7XG5pbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJy4uL3V0aWxzL3dlYmdsLWNoZWNrcyc7XG5jb25zdCBpc0Jyb3dzZXIgPSBnZXRJc0Jyb3dzZXIoKTtcbmNvbnN0IGlzUGFnZSA9IGlzQnJvd3NlciAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xuY29uc3QgQ09OVEVYVF9ERUZBVUxUUyA9IHtcbiAgd2ViZ2wyOiB0cnVlLFxuICB3ZWJnbDE6IHRydWUsXG4gIHRocm93T25FcnJvcjogdHJ1ZSxcbiAgbWFuYWdlU3RhdGU6IHRydWUsXG4gIGNhbnZhczogbnVsbCxcbiAgZGVidWc6IGZhbHNlLFxuICB3aWR0aDogODAwLFxuICBoZWlnaHQ6IDYwMFxufTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHTENvbnRleHQob3B0aW9ucyA9IHt9KSB7XG4gIGFzc2VydChpc0Jyb3dzZXIsIFwiY3JlYXRlR0xDb250ZXh0IG9ubHkgYXZhaWxhYmxlIGluIHRoZSBicm93c2VyLlxcbkNyZWF0ZSB5b3VyIG93biBoZWFkbGVzcyBjb250ZXh0IG9yIHVzZSAnY3JlYXRlSGVhZGxlc3NDb250ZXh0JyBmcm9tIEBsdW1hLmdsL3Rlc3QtdXRpbHNcIik7XG4gIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBDT05URVhUX0RFRkFVTFRTLCBvcHRpb25zKTtcbiAgY29uc3Qge1xuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gb3B0aW9ucztcblxuICBmdW5jdGlvbiBvbkVycm9yKG1lc3NhZ2UpIHtcbiAgICBpZiAob3B0aW9ucy50aHJvd09uRXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgb3B0aW9ucy5vbkVycm9yID0gb25FcnJvcjtcbiAgbGV0IGdsO1xuICBjb25zdCB7XG4gICAgY2FudmFzXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB0YXJnZXRDYW52YXMgPSBnZXRDYW52YXMoe1xuICAgIGNhbnZhcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgb25FcnJvclxuICB9KTtcbiAgZ2wgPSBjcmVhdGVCcm93c2VyQ29udGV4dCh0YXJnZXRDYW52YXMsIG9wdGlvbnMpO1xuXG4gIGlmICghZ2wpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdsID0gaW5zdHJ1bWVudEdMQ29udGV4dChnbCwgb3B0aW9ucyk7XG4gIGxvZ0luZm8oZ2wpO1xuICByZXR1cm4gZ2w7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5zdHJ1bWVudEdMQ29udGV4dChnbCwgb3B0aW9ucyA9IHt9KSB7XG4gIGlmICghZ2wgfHwgZ2wuX2luc3RydW1lbnRlZCkge1xuICAgIHJldHVybiBnbDtcbiAgfVxuXG4gIGdsLl92ZXJzaW9uID0gZ2wuX3ZlcnNpb24gfHwgZ2V0VmVyc2lvbihnbCk7XG4gIGdsLmx1bWEgPSBnbC5sdW1hIHx8IHt9O1xuICBnbC5sdW1hLmNhbnZhc1NpemVJbmZvID0gZ2wubHVtYS5jYW52YXNTaXplSW5mbyB8fCB7fTtcbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIENPTlRFWFRfREVGQVVMVFMsIG9wdGlvbnMpO1xuICBjb25zdCB7XG4gICAgbWFuYWdlU3RhdGUsXG4gICAgZGVidWdcbiAgfSA9IG9wdGlvbnM7XG5cbiAgaWYgKG1hbmFnZVN0YXRlKSB7XG4gICAgdHJhY2tDb250ZXh0U3RhdGUoZ2wsIHtcbiAgICAgIGNvcHlTdGF0ZTogZmFsc2UsXG4gICAgICBsb2c6ICguLi5hcmdzKSA9PiBsb2cubG9nKDEsIC4uLmFyZ3MpKClcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc0Jyb3dzZXIgJiYgZGVidWcpIHtcbiAgICBpZiAoIWdsb2JhbC5tYWtlRGVidWdDb250ZXh0KSB7XG4gICAgICBsb2cud2FybignV2ViR0wgZGVidWcgbW9kZSBub3QgYWN0aXZhdGVkLiBpbXBvcnQgXCJAbHVtYS5nbC9kZWJ1Z1wiIHRvIGVuYWJsZS4nKSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbCA9IGdsb2JhbC5tYWtlRGVidWdDb250ZXh0KGdsLCBvcHRpb25zKTtcbiAgICAgIGxvZy5sZXZlbCA9IE1hdGgubWF4KGxvZy5sZXZlbCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2wuX2luc3RydW1lbnRlZCA9IHRydWU7XG4gIHJldHVybiBnbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0RGVidWdJbmZvKGdsKSB7XG4gIGNvbnN0IHZlbmRvck1hc2tlZCA9IGdsLmdldFBhcmFtZXRlcig3OTM2KTtcbiAgY29uc3QgcmVuZGVyZXJNYXNrZWQgPSBnbC5nZXRQYXJhbWV0ZXIoNzkzNyk7XG4gIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbycpO1xuICBjb25zdCB2ZW5kb3JVbm1hc2tlZCA9IGV4dCAmJiBnbC5nZXRQYXJhbWV0ZXIoZXh0LlVOTUFTS0VEX1ZFTkRPUl9XRUJHTCB8fCA3OTM2KTtcbiAgY29uc3QgcmVuZGVyZXJVbm1hc2tlZCA9IGV4dCAmJiBnbC5nZXRQYXJhbWV0ZXIoZXh0LlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMIHx8IDc5MzcpO1xuICByZXR1cm4ge1xuICAgIHZlbmRvcjogdmVuZG9yVW5tYXNrZWQgfHwgdmVuZG9yTWFza2VkLFxuICAgIHJlbmRlcmVyOiByZW5kZXJlclVubWFza2VkIHx8IHJlbmRlcmVyTWFza2VkLFxuICAgIHZlbmRvck1hc2tlZCxcbiAgICByZW5kZXJlck1hc2tlZCxcbiAgICB2ZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoNzkzOCksXG4gICAgc2hhZGluZ0xhbmd1YWdlVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKDM1NzI0KVxuICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUdMQ29udGV4dChnbCwgb3B0aW9ucyA9IHt9KSB7XG4gIGlmIChnbC5jYW52YXMpIHtcbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gZ2V0RGV2aWNlUGl4ZWxSYXRpbyhvcHRpb25zLnVzZURldmljZVBpeGVscyk7XG4gICAgc2V0RGV2aWNlUGl4ZWxSYXRpbyhnbCwgZGV2aWNlUGl4ZWxSYXRpbywgb3B0aW9ucyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKCdTVEFDS0dMX3Jlc2l6ZV9kcmF3aW5nYnVmZmVyJyk7XG5cbiAgaWYgKGV4dCAmJiBgd2lkdGhgIGluIG9wdGlvbnMgJiYgYGhlaWdodGAgaW4gb3B0aW9ucykge1xuICAgIGV4dC5yZXNpemUob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJyb3dzZXJDb250ZXh0KGNhbnZhcywgb3B0aW9ucykge1xuICBjb25zdCB7XG4gICAgb25FcnJvclxuICB9ID0gb3B0aW9ucztcbiAgbGV0IGVycm9yTWVzc2FnZSA9IG51bGw7XG5cbiAgY29uc3Qgb25DcmVhdGVFcnJvciA9IGVycm9yID0+IGVycm9yTWVzc2FnZSA9IGVycm9yLnN0YXR1c01lc3NhZ2UgfHwgZXJyb3JNZXNzYWdlO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yJywgb25DcmVhdGVFcnJvciwgZmFsc2UpO1xuICBjb25zdCB7XG4gICAgd2ViZ2wxID0gdHJ1ZSxcbiAgICB3ZWJnbDIgPSB0cnVlXG4gIH0gPSBvcHRpb25zO1xuICBsZXQgZ2wgPSBudWxsO1xuXG4gIGlmICh3ZWJnbDIpIHtcbiAgICBnbCA9IGdsIHx8IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInLCBvcHRpb25zKTtcbiAgICBnbCA9IGdsIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wyJywgb3B0aW9ucyk7XG4gIH1cblxuICBpZiAod2ViZ2wxKSB7XG4gICAgZ2wgPSBnbCB8fCBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBvcHRpb25zKTtcbiAgICBnbCA9IGdsIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBvcHRpb25zKTtcbiAgfVxuXG4gIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yJywgb25DcmVhdGVFcnJvciwgZmFsc2UpO1xuXG4gIGlmICghZ2wpIHtcbiAgICByZXR1cm4gb25FcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSAke3dlYmdsMiAmJiAhd2ViZ2wxID8gJ1dlYkdMMicgOiAnV2ViR0wnfSBjb250ZXh0OiAke2Vycm9yTWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcid9YCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5vbkNvbnRleHRMb3N0KSB7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGxvc3QnLCBvcHRpb25zLm9uQ29udGV4dExvc3QsIGZhbHNlKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLm9uQ29udGV4dFJlc3RvcmVkKSB7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dHJlc3RvcmVkJywgb3B0aW9ucy5vbkNvbnRleHRSZXN0b3JlZCwgZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIGdsO1xufVxuXG5mdW5jdGlvbiBnZXRDYW52YXMoe1xuICBjYW52YXMsXG4gIHdpZHRoID0gODAwLFxuICBoZWlnaHQgPSA2MDAsXG4gIG9uRXJyb3Jcbn0pIHtcbiAgbGV0IHRhcmdldENhbnZhcztcblxuICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBpc1BhZ2VMb2FkZWQgPSBpc1BhZ2UgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJztcblxuICAgIGlmICghaXNQYWdlTG9hZGVkKSB7XG4gICAgICBvbkVycm9yKGBjcmVhdGVHTENvbnRleHQgY2FsbGVkIG9uIGNhbnZhcyAnJHtjYW52YXN9JyBiZWZvcmUgcGFnZSB3YXMgbG9hZGVkYCk7XG4gICAgfVxuXG4gICAgdGFyZ2V0Q2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcbiAgfSBlbHNlIGlmIChjYW52YXMpIHtcbiAgICB0YXJnZXRDYW52YXMgPSBjYW52YXM7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGFyZ2V0Q2FudmFzLmlkID0gJ2x1bWFnbC1jYW52YXMnO1xuICAgIHRhcmdldENhbnZhcy5zdHlsZS53aWR0aCA9IE51bWJlci5pc0Zpbml0ZSh3aWR0aCkgPyBgJHt3aWR0aH1weGAgOiAnMTAwJSc7XG4gICAgdGFyZ2V0Q2FudmFzLnN0eWxlLmhlaWdodCA9IE51bWJlci5pc0Zpbml0ZShoZWlnaHQpID8gYCR7aGVpZ2h0fXB4YCA6ICcxMDAlJztcbiAgICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSh0YXJnZXRDYW52YXMsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0Q2FudmFzO1xufVxuXG5mdW5jdGlvbiBsb2dJbmZvKGdsKSB7XG4gIGNvbnN0IHdlYkdMID0gaXNXZWJHTDIoZ2wpID8gJ1dlYkdMMicgOiAnV2ViR0wxJztcbiAgY29uc3QgaW5mbyA9IGdldENvbnRleHREZWJ1Z0luZm8oZ2wpO1xuICBjb25zdCBkcml2ZXIgPSBpbmZvID8gYCgke2luZm8udmVuZG9yfSwke2luZm8ucmVuZGVyZXJ9KWAgOiAnJztcbiAgY29uc3QgZGVidWcgPSBnbC5kZWJ1ZyA/ICcgZGVidWcnIDogJyc7XG4gIGxvZy5pbmZvKDEsIGAke3dlYkdMfSR7ZGVidWd9IGNvbnRleHQgJHtkcml2ZXJ9YCkoKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmVyc2lvbihnbCkge1xuICBpZiAodHlwZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgIT09ICd1bmRlZmluZWQnICYmIGdsIGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIHJldHVybiAyO1xuICB9XG5cbiAgcmV0dXJuIDE7XG59XG5cbmZ1bmN0aW9uIHNldERldmljZVBpeGVsUmF0aW8oZ2wsIGRldmljZVBpeGVsUmF0aW8sIG9wdGlvbnMpIHtcbiAgbGV0IGNsaWVudFdpZHRoID0gJ3dpZHRoJyBpbiBvcHRpb25zID8gb3B0aW9ucy53aWR0aCA6IGdsLmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgbGV0IGNsaWVudEhlaWdodCA9ICdoZWlnaHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLmhlaWdodCA6IGdsLmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgaWYgKCFjbGllbnRXaWR0aCB8fCAhY2xpZW50SGVpZ2h0KSB7XG4gICAgbG9nLmxvZygxLCAnQ2FudmFzIGNsaWVudFdpZHRoL2NsaWVudEhlaWdodCBpcyAwJykoKTtcbiAgICBkZXZpY2VQaXhlbFJhdGlvID0gMTtcbiAgICBjbGllbnRXaWR0aCA9IGdsLmNhbnZhcy53aWR0aCB8fCAxO1xuICAgIGNsaWVudEhlaWdodCA9IGdsLmNhbnZhcy5oZWlnaHQgfHwgMTtcbiAgfVxuXG4gIGdsLmx1bWEgPSBnbC5sdW1hIHx8IHt9O1xuICBnbC5sdW1hLmNhbnZhc1NpemVJbmZvID0gZ2wubHVtYS5jYW52YXNTaXplSW5mbyB8fCB7fTtcbiAgY29uc3QgY2FjaGVkU2l6ZSA9IGdsLmx1bWEuY2FudmFzU2l6ZUluZm87XG5cbiAgaWYgKGNhY2hlZFNpemUuY2xpZW50V2lkdGggIT09IGNsaWVudFdpZHRoIHx8IGNhY2hlZFNpemUuY2xpZW50SGVpZ2h0ICE9PSBjbGllbnRIZWlnaHQgfHwgY2FjaGVkU2l6ZS5kZXZpY2VQaXhlbFJhdGlvICE9PSBkZXZpY2VQaXhlbFJhdGlvKSB7XG4gICAgbGV0IGNsYW1wZWRQaXhlbFJhdGlvID0gZGV2aWNlUGl4ZWxSYXRpbztcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IE1hdGguZmxvb3IoY2xpZW50V2lkdGggKiBjbGFtcGVkUGl4ZWxSYXRpbyk7XG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gTWF0aC5mbG9vcihjbGllbnRIZWlnaHQgKiBjbGFtcGVkUGl4ZWxSYXRpbyk7XG4gICAgZ2wuY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgZ2wuY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcblxuICAgIGlmIChnbC5kcmF3aW5nQnVmZmVyV2lkdGggIT09IGNhbnZhc1dpZHRoIHx8IGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQgIT09IGNhbnZhc0hlaWdodCkge1xuICAgICAgbG9nLndhcm4oYERldmljZSBwaXhlbCByYXRpbyBjbGFtcGVkYCkoKTtcbiAgICAgIGNsYW1wZWRQaXhlbFJhdGlvID0gTWF0aC5taW4oZ2wuZHJhd2luZ0J1ZmZlcldpZHRoIC8gY2xpZW50V2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQgLyBjbGllbnRIZWlnaHQpO1xuICAgICAgZ2wuY2FudmFzLndpZHRoID0gTWF0aC5mbG9vcihjbGllbnRXaWR0aCAqIGNsYW1wZWRQaXhlbFJhdGlvKTtcbiAgICAgIGdsLmNhbnZhcy5oZWlnaHQgPSBNYXRoLmZsb29yKGNsaWVudEhlaWdodCAqIGNsYW1wZWRQaXhlbFJhdGlvKTtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGdsLmx1bWEuY2FudmFzU2l6ZUluZm8sIHtcbiAgICAgIGNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0LFxuICAgICAgZGV2aWNlUGl4ZWxSYXRpb1xuICAgIH0pO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb250ZXh0LmpzLm1hcCIsImV4cG9ydCB7IGxvZyB9IGZyb20gJy4vdXRpbHMvbG9nJztcbmV4cG9ydCB7IGlzV2ViR0wsIGlzV2ViR0wyLCBnZXRXZWJHTDJDb250ZXh0LCBhc3NlcnRXZWJHTENvbnRleHQsIGFzc2VydFdlYkdMMkNvbnRleHQgfSBmcm9tICcuL3V0aWxzL3dlYmdsLWNoZWNrcyc7XG5leHBvcnQgeyBwb2x5ZmlsbENvbnRleHQgfSBmcm9tICcuL3BvbHlmaWxsL3BvbHlmaWxsLWNvbnRleHQnO1xuZXhwb3J0IHsgZ2V0UGFyYW1ldGVycywgc2V0UGFyYW1ldGVycywgcmVzZXRQYXJhbWV0ZXJzLCB3aXRoUGFyYW1ldGVycyB9IGZyb20gJy4vc3RhdGUtdHJhY2tlci91bmlmaWVkLXBhcmFtZXRlci1hcGknO1xuZXhwb3J0IHsgdHJhY2tDb250ZXh0U3RhdGUsIHB1c2hDb250ZXh0U3RhdGUsIHBvcENvbnRleHRTdGF0ZSB9IGZyb20gJy4vc3RhdGUtdHJhY2tlci90cmFjay1jb250ZXh0LXN0YXRlJztcbmV4cG9ydCB7IGNyZWF0ZUdMQ29udGV4dCwgcmVzaXplR0xDb250ZXh0LCBpbnN0cnVtZW50R0xDb250ZXh0LCBnZXRDb250ZXh0RGVidWdJbmZvIH0gZnJvbSAnLi9jb250ZXh0L2NvbnRleHQnO1xuZXhwb3J0IHsgY3NzVG9EZXZpY2VSYXRpbywgY3NzVG9EZXZpY2VQaXhlbHMgfSBmcm9tICcuL3V0aWxzL2RldmljZS1waXhlbHMnO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiaW1wb3J0IHsgaXNXZWJHTDIgfSBmcm9tICcuLi91dGlscy93ZWJnbC1jaGVja3MnO1xuY29uc3QgT0VTX2VsZW1lbnRfaW5kZXggPSAnT0VTX2VsZW1lbnRfaW5kZXgnO1xuY29uc3QgV0VCR0xfZHJhd19idWZmZXJzID0gJ1dFQkdMX2RyYXdfYnVmZmVycyc7XG5jb25zdCBFWFRfZGlzam9pbnRfdGltZXJfcXVlcnkgPSAnRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5JztcbmNvbnN0IEVYVF9kaXNqb2ludF90aW1lcl9xdWVyeV93ZWJnbDIgPSAnRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5X3dlYmdsMic7XG5jb25zdCBFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMgPSAnRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJztcbmNvbnN0IFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8gPSAnV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbyc7XG5jb25zdCBHTF9GUkFHTUVOVF9TSEFERVJfREVSSVZBVElWRV9ISU5UID0gMHg4YjhiO1xuY29uc3QgR0xfRE9OVF9DQVJFID0gMHgxMTAwO1xuY29uc3QgR0xfR1BVX0RJU0pPSU5UX0VYVCA9IDB4OGZiYjtcbmNvbnN0IEdMX01BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCA9IDB4ODRmZjtcbmNvbnN0IEdMX1VOTUFTS0VEX1ZFTkRPUl9XRUJHTCA9IDB4OTI0NTtcbmNvbnN0IEdMX1VOTUFTS0VEX1JFTkRFUkVSX1dFQkdMID0gMHg5MjQ2O1xuXG5jb25zdCBnZXRXZWJHTDJWYWx1ZU9yWmVybyA9IGdsID0+ICFpc1dlYkdMMihnbCkgPyAwIDogdW5kZWZpbmVkO1xuXG5jb25zdCBXRUJHTF9QQVJBTUVURVJTID0ge1xuICBbMzA3NF06IGdsID0+ICFpc1dlYkdMMihnbCkgPyAzNjA2NCA6IHVuZGVmaW5lZCxcbiAgW0dMX0ZSQUdNRU5UX1NIQURFUl9ERVJJVkFUSVZFX0hJTlRdOiBnbCA9PiAhaXNXZWJHTDIoZ2wpID8gR0xfRE9OVF9DQVJFIDogdW5kZWZpbmVkLFxuICBbMzU5NzddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzMyOTM3XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFtHTF9HUFVfRElTSk9JTlRfRVhUXTogKGdsLCBnZXRQYXJhbWV0ZXIpID0+IHtcbiAgICBjb25zdCBleHQgPSBpc1dlYkdMMihnbCkgPyBnbC5nZXRFeHRlbnNpb24oRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5X3dlYmdsMikgOiBnbC5nZXRFeHRlbnNpb24oRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5KTtcbiAgICByZXR1cm4gZXh0ICYmIGV4dC5HUFVfRElTSk9JTlRfRVhUID8gZ2V0UGFyYW1ldGVyKGV4dC5HUFVfRElTSk9JTlRfRVhUKSA6IDA7XG4gIH0sXG4gIFtHTF9VTk1BU0tFRF9WRU5ET1JfV0VCR0xdOiAoZ2wsIGdldFBhcmFtZXRlcikgPT4ge1xuICAgIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbihXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvKTtcbiAgICByZXR1cm4gZ2V0UGFyYW1ldGVyKGV4dCAmJiBleHQuVU5NQVNLRURfVkVORE9SX1dFQkdMIHx8IDc5MzYpO1xuICB9LFxuICBbR0xfVU5NQVNLRURfUkVOREVSRVJfV0VCR0xdOiAoZ2wsIGdldFBhcmFtZXRlcikgPT4ge1xuICAgIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbihXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvKTtcbiAgICByZXR1cm4gZ2V0UGFyYW1ldGVyKGV4dCAmJiBleHQuVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgfHwgNzkzNyk7XG4gIH0sXG4gIFtHTF9NQVhfVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFRdOiAoZ2wsIGdldFBhcmFtZXRlcikgPT4ge1xuICAgIGNvbnN0IGV4dCA9IGdsLmx1bWEuZXh0ZW5zaW9uc1tFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNdO1xuICAgIHJldHVybiBleHQgPyBnZXRQYXJhbWV0ZXIoZXh0Lk1BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCkgOiAxLjA7XG4gIH0sXG4gIFszMjg4M106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUwNzFdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM3NDQ3XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNjA2M106IChnbCwgZ2V0UGFyYW1ldGVyKSA9PiB7XG4gICAgaWYgKCFpc1dlYkdMMihnbCkpIHtcbiAgICAgIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbihXRUJHTF9kcmF3X2J1ZmZlcnMpO1xuICAgICAgcmV0dXJuIGV4dCA/IGdldFBhcmFtZXRlcihleHQuTUFYX0NPTE9SX0FUVEFDSE1FTlRTX1dFQkdMKSA6IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSxcbiAgWzM1Mzc5XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTM3NF06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUzNzddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM0ODUyXTogZ2wgPT4ge1xuICAgIGlmICghaXNXZWJHTDIoZ2wpKSB7XG4gICAgICBjb25zdCBleHQgPSBnbC5nZXRFeHRlbnNpb24oV0VCR0xfZHJhd19idWZmZXJzKTtcbiAgICAgIHJldHVybiBleHQgPyBleHQuTUFYX0RSQVdfQlVGRkVSU19XRUJHTCA6IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSxcbiAgWzM2MjAzXTogZ2wgPT4gZ2wuZ2V0RXh0ZW5zaW9uKE9FU19lbGVtZW50X2luZGV4KSA/IDIxNDc0ODM2NDcgOiA2NTUzNSxcbiAgWzMzMDAxXTogZ2wgPT4gZ2wuZ2V0RXh0ZW5zaW9uKE9FU19lbGVtZW50X2luZGV4KSA/IDE2Nzc3MjE2IDogNjU1MzUsXG4gIFszMzAwMF06IGdsID0+IDE2Nzc3MjE2LFxuICBbMzcxNTddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1MzczXTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTY1N106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzYxODNdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM3MTM3XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNDA0NV06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzU5NzhdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1OTc5XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTk2OF06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUzNzZdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1Mzc1XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTY1OV06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzcxNTRdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1MzcxXTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTY1OF06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUwNzZdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1MDc3XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTM4MF06IGdldFdlYkdMMlZhbHVlT3JaZXJvXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtZXRlclBvbHlmaWxsKGdsLCBvcmlnaW5hbEdldFBhcmFtZXRlciwgcG5hbWUpIHtcbiAgY29uc3QgbGltaXQgPSBXRUJHTF9QQVJBTUVURVJTW3BuYW1lXTtcbiAgY29uc3QgdmFsdWUgPSB0eXBlb2YgbGltaXQgPT09ICdmdW5jdGlvbicgPyBsaW1pdChnbCwgb3JpZ2luYWxHZXRQYXJhbWV0ZXIsIHBuYW1lKSA6IGxpbWl0O1xuICBjb25zdCByZXN1bHQgPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiBvcmlnaW5hbEdldFBhcmFtZXRlcihwbmFtZSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXQtcGFyYW1ldGVyLXBvbHlmaWxsLmpzLm1hcCIsImltcG9ydCB7IHBvbHlmaWxsVmVydGV4QXJyYXlPYmplY3QgfSBmcm9tICcuL3BvbHlmaWxsLXZlcnRleC1hcnJheS1vYmplY3QnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IFdFQkdMMl9DT05URVhUX1BPTFlGSUxMUywgV0VCR0wyX0NPTlRFWFRfT1ZFUlJJREVTIH0gZnJvbSAnLi9wb2x5ZmlsbC10YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gcG9seWZpbGxDb250ZXh0KGdsKSB7XG4gIGdsLmx1bWEgPSBnbC5sdW1hIHx8IHt9O1xuICBjb25zdCB7XG4gICAgbHVtYVxuICB9ID0gZ2w7XG5cbiAgaWYgKCFsdW1hLnBvbHlmaWxsZWQpIHtcbiAgICBwb2x5ZmlsbFZlcnRleEFycmF5T2JqZWN0KGdsKTtcbiAgICBpbml0aWFsaXplRXh0ZW5zaW9ucyhnbCk7XG4gICAgaW5zdGFsbFBvbHlmaWxscyhnbCwgV0VCR0wyX0NPTlRFWFRfUE9MWUZJTExTKTtcbiAgICBpbnN0YWxsT3ZlcnJpZGVzKGdsLCB7XG4gICAgICB0YXJnZXQ6IGx1bWEsXG4gICAgICB0YXJnZXQyOiBnbFxuICAgIH0pO1xuICAgIGx1bWEucG9seWZpbGxlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gZ2w7XG59XG5jb25zdCBnbG9iYWxfID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3c7XG5nbG9iYWxfLnBvbHlmaWxsQ29udGV4dCA9IHBvbHlmaWxsQ29udGV4dDtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUV4dGVuc2lvbnMoZ2wpIHtcbiAgZ2wubHVtYS5leHRlbnNpb25zID0ge307XG4gIGNvbnN0IEVYVEVOU0lPTlMgPSBnbC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKCkgfHwgW107XG5cbiAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgRVhURU5TSU9OUykge1xuICAgIGdsLmx1bWFbZXh0ZW5zaW9uXSA9IGdsLmdldEV4dGVuc2lvbihleHRlbnNpb24pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxPdmVycmlkZXMoZ2wsIHtcbiAgdGFyZ2V0LFxuICB0YXJnZXQyXG59KSB7XG4gIE9iamVjdC5rZXlzKFdFQkdMMl9DT05URVhUX09WRVJSSURFUykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmICh0eXBlb2YgV0VCR0wyX0NPTlRFWFRfT1ZFUlJJREVTW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsRnVuYyA9IGdsW2tleV0gPyBnbFtrZXldLmJpbmQoZ2wpIDogKCkgPT4ge307XG4gICAgICBjb25zdCBwb2x5ZmlsbCA9IFdFQkdMMl9DT05URVhUX09WRVJSSURFU1trZXldLmJpbmQobnVsbCwgZ2wsIG9yaWdpbmFsRnVuYyk7XG4gICAgICB0YXJnZXRba2V5XSA9IHBvbHlmaWxsO1xuICAgICAgdGFyZ2V0MltrZXldID0gcG9seWZpbGw7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5zdGFsbFBvbHlmaWxscyhnbCwgcG9seWZpbGxzKSB7XG4gIGZvciAoY29uc3QgZXh0ZW5zaW9uIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHBvbHlmaWxscykpIHtcbiAgICBpZiAoZXh0ZW5zaW9uICE9PSAnb3ZlcnJpZGVzJykge1xuICAgICAgcG9seWZpbGxFeHRlbnNpb24oZ2wsIHtcbiAgICAgICAgZXh0ZW5zaW9uLFxuICAgICAgICB0YXJnZXQ6IGdsLmx1bWEsXG4gICAgICAgIHRhcmdldDI6IGdsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9seWZpbGxFeHRlbnNpb24oZ2wsIHtcbiAgZXh0ZW5zaW9uLFxuICB0YXJnZXQsXG4gIHRhcmdldDJcbn0pIHtcbiAgY29uc3QgZGVmYXVsdHMgPSBXRUJHTDJfQ09OVEVYVF9QT0xZRklMTFNbZXh0ZW5zaW9uXTtcbiAgYXNzZXJ0KGRlZmF1bHRzKTtcbiAgY29uc3Qge1xuICAgIG1ldGEgPSB7fVxuICB9ID0gZGVmYXVsdHM7XG4gIGNvbnN0IHtcbiAgICBzdWZmaXggPSAnJ1xuICB9ID0gbWV0YTtcbiAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbik7XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGVmYXVsdHMpKSB7XG4gICAgY29uc3QgZXh0S2V5ID0gYCR7a2V5fSR7c3VmZml4fWA7XG4gICAgbGV0IHBvbHlmaWxsID0gbnVsbDtcblxuICAgIGlmIChrZXkgPT09ICdtZXRhJykge30gZWxzZSBpZiAodHlwZW9mIGdsW2tleV0gPT09ICdmdW5jdGlvbicpIHt9IGVsc2UgaWYgKGV4dCAmJiB0eXBlb2YgZXh0W2V4dEtleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHBvbHlmaWxsID0gKC4uLmFyZ3MpID0+IGV4dFtleHRLZXldKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmF1bHRzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHBvbHlmaWxsID0gZGVmYXVsdHNba2V5XS5iaW5kKHRhcmdldCk7XG4gICAgfVxuXG4gICAgaWYgKHBvbHlmaWxsKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IHBvbHlmaWxsO1xuICAgICAgdGFyZ2V0MltrZXldID0gcG9seWZpbGw7XG4gICAgfVxuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wb2x5ZmlsbC1jb250ZXh0LmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJy4uL3V0aWxzL3dlYmdsLWNoZWNrcyc7XG5pbXBvcnQgeyBnZXRQYXJhbWV0ZXJQb2x5ZmlsbCB9IGZyb20gJy4vZ2V0LXBhcmFtZXRlci1wb2x5ZmlsbCc7XG5jb25zdCBPRVNfdmVydGV4X2FycmF5X29iamVjdCA9ICdPRVNfdmVydGV4X2FycmF5X29iamVjdCc7XG5jb25zdCBBTkdMRV9pbnN0YW5jZWRfYXJyYXlzID0gJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnO1xuY29uc3QgV0VCR0xfZHJhd19idWZmZXJzID0gJ1dFQkdMX2RyYXdfYnVmZmVycyc7XG5jb25zdCBFWFRfZGlzam9pbnRfdGltZXJfcXVlcnkgPSAnRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5JztcbmNvbnN0IEVYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYyA9ICdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnO1xuY29uc3QgRVJSX1ZBT19OT1RfU1VQUE9SVEVEID0gJ1ZlcnRleEFycmF5IHJlcXVpcmVzIFdlYkdMMiBvciBPRVNfdmVydGV4X2FycmF5X29iamVjdCBleHRlbnNpb24nO1xuXG5mdW5jdGlvbiBnZXRFeHRlbnNpb25EYXRhKGdsLCBleHRlbnNpb24pIHtcbiAgcmV0dXJuIHtcbiAgICB3ZWJnbDI6IGlzV2ViR0wyKGdsKSxcbiAgICBleHQ6IGdsLmdldEV4dGVuc2lvbihleHRlbnNpb24pXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBXRUJHTDJfQ09OVEVYVF9QT0xZRklMTFMgPSB7XG4gIFtPRVNfdmVydGV4X2FycmF5X29iamVjdF06IHtcbiAgICBtZXRhOiB7XG4gICAgICBzdWZmaXg6ICdPRVMnXG4gICAgfSxcbiAgICBjcmVhdGVWZXJ0ZXhBcnJheTogKCkgPT4ge1xuICAgICAgYXNzZXJ0KGZhbHNlLCBFUlJfVkFPX05PVF9TVVBQT1JURUQpO1xuICAgIH0sXG4gICAgZGVsZXRlVmVydGV4QXJyYXk6ICgpID0+IHt9LFxuICAgIGJpbmRWZXJ0ZXhBcnJheTogKCkgPT4ge30sXG4gICAgaXNWZXJ0ZXhBcnJheTogKCkgPT4gZmFsc2VcbiAgfSxcbiAgW0FOR0xFX2luc3RhbmNlZF9hcnJheXNdOiB7XG4gICAgbWV0YToge1xuICAgICAgc3VmZml4OiAnQU5HTEUnXG4gICAgfSxcblxuICAgIHZlcnRleEF0dHJpYkRpdmlzb3IobG9jYXRpb24sIGRpdmlzb3IpIHtcbiAgICAgIGFzc2VydChkaXZpc29yID09PSAwLCAnV2ViR0wgaW5zdGFuY2VkIHJlbmRlcmluZyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfSxcblxuICAgIGRyYXdFbGVtZW50c0luc3RhbmNlZDogKCkgPT4ge30sXG4gICAgZHJhd0FycmF5c0luc3RhbmNlZDogKCkgPT4ge31cbiAgfSxcbiAgW1dFQkdMX2RyYXdfYnVmZmVyc106IHtcbiAgICBtZXRhOiB7XG4gICAgICBzdWZmaXg6ICdXRUJHTCdcbiAgICB9LFxuICAgIGRyYXdCdWZmZXJzOiAoKSA9PiB7XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH1cbiAgfSxcbiAgW0VYVF9kaXNqb2ludF90aW1lcl9xdWVyeV06IHtcbiAgICBtZXRhOiB7XG4gICAgICBzdWZmaXg6ICdFWFQnXG4gICAgfSxcbiAgICBjcmVhdGVRdWVyeTogKCkgPT4ge1xuICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9LFxuICAgIGRlbGV0ZVF1ZXJ5OiAoKSA9PiB7XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH0sXG4gICAgYmVnaW5RdWVyeTogKCkgPT4ge1xuICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9LFxuICAgIGVuZFF1ZXJ5OiAoKSA9PiB7fSxcblxuICAgIGdldFF1ZXJ5KGhhbmRsZSwgcG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFF1ZXJ5T2JqZWN0KGhhbmRsZSwgcG5hbWUpO1xuICAgIH0sXG5cbiAgICBnZXRRdWVyeVBhcmFtZXRlcihoYW5kbGUsIHBuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRRdWVyeU9iamVjdChoYW5kbGUsIHBuYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0UXVlcnlPYmplY3Q6ICgpID0+IHt9XG4gIH1cbn07XG5leHBvcnQgY29uc3QgV0VCR0wyX0NPTlRFWFRfT1ZFUlJJREVTID0ge1xuICByZWFkQnVmZmVyOiAoZ2wsIG9yaWdpbmFsRnVuYywgYXR0YWNobWVudCkgPT4ge1xuICAgIGlmIChpc1dlYkdMMihnbCkpIHtcbiAgICAgIG9yaWdpbmFsRnVuYyhhdHRhY2htZW50KTtcbiAgICB9IGVsc2Uge31cbiAgfSxcbiAgZ2V0VmVydGV4QXR0cmliOiAoZ2wsIG9yaWdpbmFsRnVuYywgbG9jYXRpb24sIHBuYW1lKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgd2ViZ2wyLFxuICAgICAgZXh0XG4gICAgfSA9IGdldEV4dGVuc2lvbkRhdGEoZ2wsIEFOR0xFX2luc3RhbmNlZF9hcnJheXMpO1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICBjYXNlIDM1MDY5OlxuICAgICAgICByZXN1bHQgPSAhd2ViZ2wyID8gZmFsc2UgOiB1bmRlZmluZWQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM1MDcwOlxuICAgICAgICByZXN1bHQgPSAhd2ViZ2wyICYmICFleHQgPyAwIDogdW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0ICE9PSB1bmRlZmluZWQgPyByZXN1bHQgOiBvcmlnaW5hbEZ1bmMobG9jYXRpb24sIHBuYW1lKTtcbiAgfSxcbiAgZ2V0UHJvZ3JhbVBhcmFtZXRlcjogKGdsLCBvcmlnaW5hbEZ1bmMsIHByb2dyYW0sIHBuYW1lKSA9PiB7XG4gICAgaWYgKCFpc1dlYkdMMihnbCkpIHtcbiAgICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgICAgY2FzZSAzNTk2NzpcbiAgICAgICAgICByZXR1cm4gMzU5ODE7XG5cbiAgICAgICAgY2FzZSAzNTk3MTpcbiAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICBjYXNlIDM1MzgyOlxuICAgICAgICAgIHJldHVybiAwO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsRnVuYyhwcm9ncmFtLCBwbmFtZSk7XG4gIH0sXG4gIGdldEludGVybmFsZm9ybWF0UGFyYW1ldGVyOiAoZ2wsIG9yaWdpbmFsRnVuYywgdGFyZ2V0LCBmb3JtYXQsIHBuYW1lKSA9PiB7XG4gICAgaWYgKCFpc1dlYkdMMihnbCkpIHtcbiAgICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgICAgY2FzZSAzMjkzNzpcbiAgICAgICAgICByZXR1cm4gbmV3IEludDMyQXJyYXkoWzBdKTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBnbC5nZXRJbnRlcm5hbGZvcm1hdFBhcmFtZXRlcih0YXJnZXQsIGZvcm1hdCwgcG5hbWUpO1xuICB9LFxuXG4gIGdldFRleFBhcmFtZXRlcihnbCwgb3JpZ2luYWxGdW5jLCB0YXJnZXQsIHBuYW1lKSB7XG4gICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgY2FzZSAzNDA0NjpcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGV4dGVuc2lvbnNcbiAgICAgICAgfSA9IGdsLmx1bWE7XG4gICAgICAgIGNvbnN0IGV4dCA9IGV4dGVuc2lvbnNbRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXTtcbiAgICAgICAgcG5hbWUgPSBleHQgJiYgZXh0LlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUIHx8IDM0MDQ2O1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWxGdW5jKHRhcmdldCwgcG5hbWUpO1xuICB9LFxuXG4gIGdldFBhcmFtZXRlcjogZ2V0UGFyYW1ldGVyUG9seWZpbGwsXG5cbiAgaGludChnbCwgb3JpZ2luYWxGdW5jLCBwbmFtZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxGdW5jKHBuYW1lLCB2YWx1ZSk7XG4gIH1cblxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvbHlmaWxsLXRhYmxlLmpzLm1hcCIsImltcG9ydCB7IGdsb2JhbCB9IGZyb20gJ3Byb2JlLmdsL2Vudic7XG5jb25zdCBnbEVycm9yU2hhZG93ID0ge307XG5cbmZ1bmN0aW9uIGVycm9yKG1zZykge1xuICBpZiAoZ2xvYmFsLmNvbnNvbGUgJiYgZ2xvYmFsLmNvbnNvbGUuZXJyb3IpIHtcbiAgICBnbG9iYWwuY29uc29sZS5lcnJvcihtc2cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZyhtc2cpIHtcbiAgaWYgKGdsb2JhbC5jb25zb2xlICYmIGdsb2JhbC5jb25zb2xlLmxvZykge1xuICAgIGdsb2JhbC5jb25zb2xlLmxvZyhtc2cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN5bnRoZXNpemVHTEVycm9yKGVyciwgb3B0X21zZykge1xuICBnbEVycm9yU2hhZG93W2Vycl0gPSB0cnVlO1xuXG4gIGlmIChvcHRfbXNnICE9PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcihvcHRfbXNnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cmFwR0xFcnJvcihnbCkge1xuICBjb25zdCBmID0gZ2wuZ2V0RXJyb3I7XG5cbiAgZ2wuZ2V0RXJyb3IgPSBmdW5jdGlvbiBnZXRFcnJvcigpIHtcbiAgICBsZXQgZXJyO1xuXG4gICAgZG8ge1xuICAgICAgZXJyID0gZi5hcHBseShnbCk7XG5cbiAgICAgIGlmIChlcnIgIT09IDApIHtcbiAgICAgICAgZ2xFcnJvclNoYWRvd1tlcnJdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IHdoaWxlIChlcnIgIT09IDApO1xuXG4gICAgZm9yIChlcnIgaW4gZ2xFcnJvclNoYWRvdykge1xuICAgICAgaWYgKGdsRXJyb3JTaGFkb3dbZXJyXSkge1xuICAgICAgICBkZWxldGUgZ2xFcnJvclNoYWRvd1tlcnJdO1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZXJyLCAxMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH07XG59XG5cbmNvbnN0IFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVMgPSBmdW5jdGlvbiBXZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTKGV4dCkge1xuICBjb25zdCBnbCA9IGV4dC5nbDtcbiAgdGhpcy5leHQgPSBleHQ7XG4gIHRoaXMuaXNBbGl2ZSA9IHRydWU7XG4gIHRoaXMuaGFzQmVlbkJvdW5kID0gZmFsc2U7XG4gIHRoaXMuZWxlbWVudEFycmF5QnVmZmVyID0gbnVsbDtcbiAgdGhpcy5hdHRyaWJzID0gbmV3IEFycmF5KGV4dC5tYXhWZXJ0ZXhBdHRyaWJzKTtcblxuICBmb3IgKGxldCBuID0gMDsgbiA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IG4rKykge1xuICAgIGNvbnN0IGF0dHJpYiA9IG5ldyBXZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTLlZlcnRleEF0dHJpYihnbCk7XG4gICAgdGhpcy5hdHRyaWJzW25dID0gYXR0cmliO1xuICB9XG5cbiAgdGhpcy5tYXhBdHRyaWIgPSAwO1xufTtcblxuV2ViR0xWZXJ0ZXhBcnJheU9iamVjdE9FUy5WZXJ0ZXhBdHRyaWIgPSBmdW5jdGlvbiBWZXJ0ZXhBdHRyaWIoZ2wpIHtcbiAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gIHRoaXMuYnVmZmVyID0gbnVsbDtcbiAgdGhpcy5zaXplID0gNDtcbiAgdGhpcy50eXBlID0gNTEyNjtcbiAgdGhpcy5ub3JtYWxpemVkID0gZmFsc2U7XG4gIHRoaXMuc3RyaWRlID0gMTY7XG4gIHRoaXMub2Zmc2V0ID0gMDtcbiAgdGhpcy5jYWNoZWQgPSAnJztcbiAgdGhpcy5yZWNhY2hlKCk7XG59O1xuXG5XZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTLlZlcnRleEF0dHJpYi5wcm90b3R5cGUucmVjYWNoZSA9IGZ1bmN0aW9uIHJlY2FjaGUoKSB7XG4gIHRoaXMuY2FjaGVkID0gW3RoaXMuc2l6ZSwgdGhpcy50eXBlLCB0aGlzLm5vcm1hbGl6ZWQsIHRoaXMuc3RyaWRlLCB0aGlzLm9mZnNldF0uam9pbignOicpO1xufTtcblxuY29uc3QgT0VTVmVydGV4QXJyYXlPYmplY3QgPSBmdW5jdGlvbiBPRVNWZXJ0ZXhBcnJheU9iamVjdChnbCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgdGhpcy5nbCA9IGdsO1xuICB3cmFwR0xFcnJvcihnbCk7XG4gIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5vcmlnaW5hbCA9IHtcbiAgICBnZXRQYXJhbWV0ZXI6IGdsLmdldFBhcmFtZXRlcixcbiAgICBlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheTogZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXksXG4gICAgZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5OiBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXksXG4gICAgYmluZEJ1ZmZlcjogZ2wuYmluZEJ1ZmZlcixcbiAgICBnZXRWZXJ0ZXhBdHRyaWI6IGdsLmdldFZlcnRleEF0dHJpYixcbiAgICB2ZXJ0ZXhBdHRyaWJQb2ludGVyOiBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyXG4gIH07XG5cbiAgZ2wuZ2V0UGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0UGFyYW1ldGVyKHBuYW1lKSB7XG4gICAgaWYgKHBuYW1lID09PSBzZWxmLlZFUlRFWF9BUlJBWV9CSU5ESU5HX09FUykge1xuICAgICAgaWYgKHNlbGYuY3VycmVudFZlcnRleEFycmF5T2JqZWN0ID09PSBzZWxmLmRlZmF1bHRWZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGYuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbC5nZXRQYXJhbWV0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSA9IGZ1bmN0aW9uIGVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KSB7XG4gICAgY29uc3QgdmFvID0gc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3Q7XG4gICAgdmFvLm1heEF0dHJpYiA9IE1hdGgubWF4KHZhby5tYXhBdHRyaWIsIGluZGV4KTtcbiAgICBjb25zdCBhdHRyaWIgPSB2YW8uYXR0cmlic1tpbmRleF07XG4gICAgYXR0cmliLmVuYWJsZWQgPSB0cnVlO1xuICAgIHJldHVybiBvcmlnaW5hbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSA9IGZ1bmN0aW9uIGRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleCkge1xuICAgIGNvbnN0IHZhbyA9IHNlbGYuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuICAgIHZhby5tYXhBdHRyaWIgPSBNYXRoLm1heCh2YW8ubWF4QXR0cmliLCBpbmRleCk7XG4gICAgY29uc3QgYXR0cmliID0gdmFvLmF0dHJpYnNbaW5kZXhdO1xuICAgIGF0dHJpYi5lbmFibGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIG9yaWdpbmFsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGdsLmJpbmRCdWZmZXIgPSBmdW5jdGlvbiBiaW5kQnVmZmVyKHRhcmdldCwgYnVmZmVyKSB7XG4gICAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICAgIGNhc2UgMzQ5NjI6XG4gICAgICAgIHNlbGYuY3VycmVudEFycmF5QnVmZmVyID0gYnVmZmVyO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzNDk2MzpcbiAgICAgICAgc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3QuZWxlbWVudEFycmF5QnVmZmVyID0gYnVmZmVyO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWwuYmluZEJ1ZmZlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGdsLmdldFZlcnRleEF0dHJpYiA9IGZ1bmN0aW9uIGdldFZlcnRleEF0dHJpYihpbmRleCwgcG5hbWUpIHtcbiAgICBjb25zdCB2YW8gPSBzZWxmLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdDtcbiAgICBjb25zdCBhdHRyaWIgPSB2YW8uYXR0cmlic1tpbmRleF07XG5cbiAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICBjYXNlIDM0OTc1OlxuICAgICAgICByZXR1cm4gYXR0cmliLmJ1ZmZlcjtcblxuICAgICAgY2FzZSAzNDMzODpcbiAgICAgICAgcmV0dXJuIGF0dHJpYi5lbmFibGVkO1xuXG4gICAgICBjYXNlIDM0MzM5OlxuICAgICAgICByZXR1cm4gYXR0cmliLnNpemU7XG5cbiAgICAgIGNhc2UgMzQzNDA6XG4gICAgICAgIHJldHVybiBhdHRyaWIuc3RyaWRlO1xuXG4gICAgICBjYXNlIDM0MzQxOlxuICAgICAgICByZXR1cm4gYXR0cmliLnR5cGU7XG5cbiAgICAgIGNhc2UgMzQ5MjI6XG4gICAgICAgIHJldHVybiBhdHRyaWIubm9ybWFsaXplZDtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsLmdldFZlcnRleEF0dHJpYi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcblxuICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyID0gZnVuY3Rpb24gdmVydGV4QXR0cmliUG9pbnRlcihpbmR4LCBzaXplLCB0eXBlLCBub3JtYWxpemVkLCBzdHJpZGUsIG9mZnNldCkge1xuICAgIGNvbnN0IHZhbyA9IHNlbGYuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuICAgIHZhby5tYXhBdHRyaWIgPSBNYXRoLm1heCh2YW8ubWF4QXR0cmliLCBpbmR4KTtcbiAgICBjb25zdCBhdHRyaWIgPSB2YW8uYXR0cmlic1tpbmR4XTtcbiAgICBhdHRyaWIuYnVmZmVyID0gc2VsZi5jdXJyZW50QXJyYXlCdWZmZXI7XG4gICAgYXR0cmliLnNpemUgPSBzaXplO1xuICAgIGF0dHJpYi50eXBlID0gdHlwZTtcbiAgICBhdHRyaWIubm9ybWFsaXplZCA9IG5vcm1hbGl6ZWQ7XG4gICAgYXR0cmliLnN0cmlkZSA9IHN0cmlkZTtcbiAgICBhdHRyaWIub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIGF0dHJpYi5yZWNhY2hlKCk7XG4gICAgcmV0dXJuIG9yaWdpbmFsLnZlcnRleEF0dHJpYlBvaW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICBpZiAoZ2wuaW5zdHJ1bWVudEV4dGVuc2lvbikge1xuICAgIGdsLmluc3RydW1lbnRFeHRlbnNpb24odGhpcywgJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0Jyk7XG4gIH1cblxuICBpZiAoZ2wuY2FudmFzKSB7XG4gICAgZ2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dHJlc3RvcmVkJywgKCkgPT4ge1xuICAgICAgbG9nKCdPRVNWZXJ0ZXhBcnJheU9iamVjdCBlbXVsYXRpb24gbGlicmFyeSBjb250ZXh0IHJlc3RvcmVkJyk7XG4gICAgICBzZWxmLnJlc2V0XygpO1xuICAgIH0sIHRydWUpO1xuICB9XG5cbiAgdGhpcy5yZXNldF8oKTtcbn07XG5cbk9FU1ZlcnRleEFycmF5T2JqZWN0LnByb3RvdHlwZS5WRVJURVhfQVJSQVlfQklORElOR19PRVMgPSAweDg1YjU7XG5cbk9FU1ZlcnRleEFycmF5T2JqZWN0LnByb3RvdHlwZS5yZXNldF8gPSBmdW5jdGlvbiByZXNldF8oKSB7XG4gIGNvbnN0IGNvbnRleHRXYXNMb3N0ID0gdGhpcy52ZXJ0ZXhBcnJheU9iamVjdHMgIT09IHVuZGVmaW5lZDtcblxuICBpZiAoY29udGV4dFdhc0xvc3QpIHtcbiAgICBmb3IgKGxldCBpaSA9IDA7IGlpIDwgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdHMubGVuZ3RoOyArK2lpKSB7XG4gICAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0cy5pc0FsaXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICB0aGlzLm1heFZlcnRleEF0dHJpYnMgPSBnbC5nZXRQYXJhbWV0ZXIoMzQ5MjEpO1xuICB0aGlzLmRlZmF1bHRWZXJ0ZXhBcnJheU9iamVjdCA9IG5ldyBXZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTKHRoaXMpO1xuICB0aGlzLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdCA9IG51bGw7XG4gIHRoaXMuY3VycmVudEFycmF5QnVmZmVyID0gbnVsbDtcbiAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdHMgPSBbdGhpcy5kZWZhdWx0VmVydGV4QXJyYXlPYmplY3RdO1xuICB0aGlzLmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbn07XG5cbk9FU1ZlcnRleEFycmF5T2JqZWN0LnByb3RvdHlwZS5jcmVhdGVWZXJ0ZXhBcnJheU9FUyA9IGZ1bmN0aW9uIGNyZWF0ZVZlcnRleEFycmF5T0VTKCkge1xuICBjb25zdCBhcnJheU9iamVjdCA9IG5ldyBXZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTKHRoaXMpO1xuICB0aGlzLnZlcnRleEFycmF5T2JqZWN0cy5wdXNoKGFycmF5T2JqZWN0KTtcbiAgcmV0dXJuIGFycmF5T2JqZWN0O1xufTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLmRlbGV0ZVZlcnRleEFycmF5T0VTID0gZnVuY3Rpb24gZGVsZXRlVmVydGV4QXJyYXlPRVMoYXJyYXlPYmplY3QpIHtcbiAgYXJyYXlPYmplY3QuaXNBbGl2ZSA9IGZhbHNlO1xuICB0aGlzLnZlcnRleEFycmF5T2JqZWN0cy5zcGxpY2UodGhpcy52ZXJ0ZXhBcnJheU9iamVjdHMuaW5kZXhPZihhcnJheU9iamVjdCksIDEpO1xuXG4gIGlmICh0aGlzLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdCA9PT0gYXJyYXlPYmplY3QpIHtcbiAgICB0aGlzLmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbiAgfVxufTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLmlzVmVydGV4QXJyYXlPRVMgPSBmdW5jdGlvbiBpc1ZlcnRleEFycmF5T0VTKGFycmF5T2JqZWN0KSB7XG4gIGlmIChhcnJheU9iamVjdCAmJiBhcnJheU9iamVjdCBpbnN0YW5jZW9mIFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVMpIHtcbiAgICBpZiAoYXJyYXlPYmplY3QuaGFzQmVlbkJvdW5kICYmIGFycmF5T2JqZWN0LmV4dCA9PT0gdGhpcykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLmJpbmRWZXJ0ZXhBcnJheU9FUyA9IGZ1bmN0aW9uIGJpbmRWZXJ0ZXhBcnJheU9FUyhhcnJheU9iamVjdCkge1xuICBjb25zdCBnbCA9IHRoaXMuZ2w7XG5cbiAgaWYgKGFycmF5T2JqZWN0ICYmICFhcnJheU9iamVjdC5pc0FsaXZlKSB7XG4gICAgc3ludGhlc2l6ZUdMRXJyb3IoMTI4MiwgJ2JpbmRWZXJ0ZXhBcnJheU9FUzogYXR0ZW1wdCB0byBiaW5kIGRlbGV0ZWQgYXJyYXlPYmplY3QnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBvcmlnaW5hbCA9IHRoaXMub3JpZ2luYWw7XG4gIGNvbnN0IG9sZFZBTyA9IHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuICB0aGlzLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdCA9IGFycmF5T2JqZWN0IHx8IHRoaXMuZGVmYXVsdFZlcnRleEFycmF5T2JqZWN0O1xuICB0aGlzLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdC5oYXNCZWVuQm91bmQgPSB0cnVlO1xuICBjb25zdCBuZXdWQU8gPSB0aGlzLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdDtcblxuICBpZiAob2xkVkFPID09PSBuZXdWQU8pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIW9sZFZBTyB8fCBuZXdWQU8uZWxlbWVudEFycmF5QnVmZmVyICE9PSBvbGRWQU8uZWxlbWVudEFycmF5QnVmZmVyKSB7XG4gICAgb3JpZ2luYWwuYmluZEJ1ZmZlci5jYWxsKGdsLCAzNDk2MywgbmV3VkFPLmVsZW1lbnRBcnJheUJ1ZmZlcik7XG4gIH1cblxuICBsZXQgY3VycmVudEJpbmRpbmcgPSB0aGlzLmN1cnJlbnRBcnJheUJ1ZmZlcjtcbiAgY29uc3QgbWF4QXR0cmliID0gTWF0aC5tYXgob2xkVkFPID8gb2xkVkFPLm1heEF0dHJpYiA6IDAsIG5ld1ZBTy5tYXhBdHRyaWIpO1xuXG4gIGZvciAobGV0IG4gPSAwOyBuIDw9IG1heEF0dHJpYjsgbisrKSB7XG4gICAgY29uc3QgYXR0cmliID0gbmV3VkFPLmF0dHJpYnNbbl07XG4gICAgY29uc3Qgb2xkQXR0cmliID0gb2xkVkFPID8gb2xkVkFPLmF0dHJpYnNbbl0gOiBudWxsO1xuXG4gICAgaWYgKCFvbGRWQU8gfHwgYXR0cmliLmVuYWJsZWQgIT09IG9sZEF0dHJpYi5lbmFibGVkKSB7XG4gICAgICBpZiAoYXR0cmliLmVuYWJsZWQpIHtcbiAgICAgICAgb3JpZ2luYWwuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkuY2FsbChnbCwgbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmlnaW5hbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkuY2FsbChnbCwgbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGF0dHJpYi5lbmFibGVkKSB7XG4gICAgICBsZXQgYnVmZmVyQ2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgICBpZiAoIW9sZFZBTyB8fCBhdHRyaWIuYnVmZmVyICE9PSBvbGRBdHRyaWIuYnVmZmVyKSB7XG4gICAgICAgIGlmIChjdXJyZW50QmluZGluZyAhPT0gYXR0cmliLmJ1ZmZlcikge1xuICAgICAgICAgIG9yaWdpbmFsLmJpbmRCdWZmZXIuY2FsbChnbCwgMzQ5NjIsIGF0dHJpYi5idWZmZXIpO1xuICAgICAgICAgIGN1cnJlbnRCaW5kaW5nID0gYXR0cmliLmJ1ZmZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1ZmZlckNoYW5nZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoYnVmZmVyQ2hhbmdlZCB8fCBhdHRyaWIuY2FjaGVkICE9PSBvbGRBdHRyaWIuY2FjaGVkKSB7XG4gICAgICAgIG9yaWdpbmFsLnZlcnRleEF0dHJpYlBvaW50ZXIuY2FsbChnbCwgbiwgYXR0cmliLnNpemUsIGF0dHJpYi50eXBlLCBhdHRyaWIubm9ybWFsaXplZCwgYXR0cmliLnN0cmlkZSwgYXR0cmliLm9mZnNldCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMuY3VycmVudEFycmF5QnVmZmVyICE9PSBjdXJyZW50QmluZGluZykge1xuICAgIG9yaWdpbmFsLmJpbmRCdWZmZXIuY2FsbChnbCwgMzQ5NjIsIHRoaXMuY3VycmVudEFycmF5QnVmZmVyKTtcbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlmaWxsVmVydGV4QXJyYXlPYmplY3QoZ2wpIHtcbiAgaWYgKHR5cGVvZiBnbC5jcmVhdGVWZXJ0ZXhBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbmFsX2dldFN1cHBvcnRlZEV4dGVuc2lvbnMgPSBnbC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zO1xuXG4gIGdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMgPSBmdW5jdGlvbiBnZXRTdXBwb3J0ZWRFeHRlbnNpb25zKCkge1xuICAgIGNvbnN0IGxpc3QgPSBvcmlnaW5hbF9nZXRTdXBwb3J0ZWRFeHRlbnNpb25zLmNhbGwodGhpcykgfHwgW107XG5cbiAgICBpZiAobGlzdC5pbmRleE9mKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpIDwgMCkge1xuICAgICAgbGlzdC5wdXNoKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpO1xuICAgIH1cblxuICAgIHJldHVybiBsaXN0O1xuICB9O1xuXG4gIGNvbnN0IG9yaWdpbmFsX2dldEV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbjtcblxuICBnbC5nZXRFeHRlbnNpb24gPSBmdW5jdGlvbiBnZXRFeHRlbnNpb24obmFtZSkge1xuICAgIGNvbnN0IGV4dCA9IG9yaWdpbmFsX2dldEV4dGVuc2lvbi5jYWxsKHRoaXMsIG5hbWUpO1xuXG4gICAgaWYgKGV4dCkge1xuICAgICAgcmV0dXJuIGV4dDtcbiAgICB9XG5cbiAgICBpZiAobmFtZSAhPT0gJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFnbC5fX09FU1ZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICB0aGlzLl9fT0VTVmVydGV4QXJyYXlPYmplY3QgPSBuZXcgT0VTVmVydGV4QXJyYXlPYmplY3QodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19PRVNWZXJ0ZXhBcnJheU9iamVjdDtcbiAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvbHlmaWxsLXZlcnRleC1hcnJheS1vYmplY3QuanMubWFwIiwiaW1wb3J0IHsgR0xfUEFSQU1FVEVSX0RFRkFVTFRTLCBHTF9IT09LRURfU0VUVEVSUyB9IGZyb20gJy4vd2ViZ2wtcGFyYW1ldGVyLXRhYmxlcyc7XG5pbXBvcnQgeyBzZXRQYXJhbWV0ZXJzLCBnZXRQYXJhbWV0ZXJzIH0gZnJvbSAnLi91bmlmaWVkLXBhcmFtZXRlci1hcGknO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGRlZXBBcnJheUVxdWFsIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuXG5mdW5jdGlvbiBpbnN0YWxsR2V0dGVyT3ZlcnJpZGUoZ2wsIGZ1bmN0aW9uTmFtZSkge1xuICBjb25zdCBvcmlnaW5hbEdldHRlckZ1bmMgPSBnbFtmdW5jdGlvbk5hbWVdLmJpbmQoZ2wpO1xuXG4gIGdsW2Z1bmN0aW9uTmFtZV0gPSBmdW5jdGlvbiBnZXQoLi4ucGFyYW1zKSB7XG4gICAgY29uc3QgcG5hbWUgPSBwYXJhbXNbMF07XG5cbiAgICBpZiAoIShwbmFtZSBpbiBnbC5zdGF0ZS5jYWNoZSkpIHtcbiAgICAgIHJldHVybiBvcmlnaW5hbEdldHRlckZ1bmMoLi4ucGFyYW1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2wuc3RhdGUuZW5hYmxlID8gZ2wuc3RhdGUuY2FjaGVbcG5hbWVdIDogb3JpZ2luYWxHZXR0ZXJGdW5jKC4uLnBhcmFtcyk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsW2Z1bmN0aW9uTmFtZV0sICduYW1lJywge1xuICAgIHZhbHVlOiBgJHtmdW5jdGlvbk5hbWV9LWZyb20tY2FjaGVgLFxuICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxTZXR0ZXJTcHkoZ2wsIGZ1bmN0aW9uTmFtZSwgc2V0dGVyKSB7XG4gIGNvbnN0IG9yaWdpbmFsU2V0dGVyRnVuYyA9IGdsW2Z1bmN0aW9uTmFtZV0uYmluZChnbCk7XG5cbiAgZ2xbZnVuY3Rpb25OYW1lXSA9IGZ1bmN0aW9uIHNldCguLi5wYXJhbXMpIHtcbiAgICBjb25zdCB7XG4gICAgICB2YWx1ZUNoYW5nZWQsXG4gICAgICBvbGRWYWx1ZVxuICAgIH0gPSBzZXR0ZXIoZ2wuc3RhdGUuX3VwZGF0ZUNhY2hlLCAuLi5wYXJhbXMpO1xuXG4gICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgb3JpZ2luYWxTZXR0ZXJGdW5jKC4uLnBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9sZFZhbHVlO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbFtmdW5jdGlvbk5hbWVdLCAnbmFtZScsIHtcbiAgICB2YWx1ZTogYCR7ZnVuY3Rpb25OYW1lfS10by1jYWNoZWAsXG4gICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5zdGFsbFByb2dyYW1TcHkoZ2wpIHtcbiAgY29uc3Qgb3JpZ2luYWxVc2VQcm9ncmFtID0gZ2wudXNlUHJvZ3JhbS5iaW5kKGdsKTtcblxuICBnbC51c2VQcm9ncmFtID0gZnVuY3Rpb24gdXNlUHJvZ3JhbUx1bWEoaGFuZGxlKSB7XG4gICAgaWYgKGdsLnN0YXRlLnByb2dyYW0gIT09IGhhbmRsZSkge1xuICAgICAgb3JpZ2luYWxVc2VQcm9ncmFtKGhhbmRsZSk7XG4gICAgICBnbC5zdGF0ZS5wcm9ncmFtID0gaGFuZGxlO1xuICAgIH1cbiAgfTtcbn1cblxuY2xhc3MgR0xTdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKGdsLCB7XG4gICAgY29weVN0YXRlID0gZmFsc2UsXG4gICAgbG9nID0gKCkgPT4ge31cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgdGhpcy5zdGF0ZVN0YWNrID0gW107XG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xuICAgIHRoaXMuY2FjaGUgPSBjb3B5U3RhdGUgPyBnZXRQYXJhbWV0ZXJzKGdsKSA6IE9iamVjdC5hc3NpZ24oe30sIEdMX1BBUkFNRVRFUl9ERUZBVUxUUyk7XG4gICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgdGhpcy5fdXBkYXRlQ2FjaGUgPSB0aGlzLl91cGRhdGVDYWNoZS5iaW5kKHRoaXMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgcHVzaCh2YWx1ZXMgPSB7fSkge1xuICAgIHRoaXMuc3RhdGVTdGFjay5wdXNoKHt9KTtcbiAgfVxuXG4gIHBvcCgpIHtcbiAgICBhc3NlcnQodGhpcy5zdGF0ZVN0YWNrLmxlbmd0aCA+IDApO1xuICAgIGNvbnN0IG9sZFZhbHVlcyA9IHRoaXMuc3RhdGVTdGFja1t0aGlzLnN0YXRlU3RhY2subGVuZ3RoIC0gMV07XG4gICAgc2V0UGFyYW1ldGVycyh0aGlzLmdsLCBvbGRWYWx1ZXMpO1xuICAgIHRoaXMuc3RhdGVTdGFjay5wb3AoKTtcbiAgfVxuXG4gIF91cGRhdGVDYWNoZSh2YWx1ZXMpIHtcbiAgICBsZXQgdmFsdWVDaGFuZ2VkID0gZmFsc2U7XG4gICAgbGV0IG9sZFZhbHVlO1xuICAgIGNvbnN0IG9sZFZhbHVlcyA9IHRoaXMuc3RhdGVTdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhdGVTdGFja1t0aGlzLnN0YXRlU3RhY2subGVuZ3RoIC0gMV07XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZXMpIHtcbiAgICAgIGFzc2VydChrZXkgIT09IHVuZGVmaW5lZCk7XG4gICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1trZXldO1xuICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5jYWNoZVtrZXldO1xuXG4gICAgICBpZiAoIWRlZXBBcnJheUVxdWFsKHZhbHVlLCBjYWNoZWQpKSB7XG4gICAgICAgIHZhbHVlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG9sZFZhbHVlID0gY2FjaGVkO1xuXG4gICAgICAgIGlmIChvbGRWYWx1ZXMgJiYgIShrZXkgaW4gb2xkVmFsdWVzKSkge1xuICAgICAgICAgIG9sZFZhbHVlc1trZXldID0gY2FjaGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWNoZVtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlQ2hhbmdlZCxcbiAgICAgIG9sZFZhbHVlXG4gICAgfTtcbiAgfVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFja0NvbnRleHRTdGF0ZShnbCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICBlbmFibGUgPSB0cnVlLFxuICAgIGNvcHlTdGF0ZVxuICB9ID0gb3B0aW9ucztcbiAgYXNzZXJ0KGNvcHlTdGF0ZSAhPT0gdW5kZWZpbmVkKTtcblxuICBpZiAoIWdsLnN0YXRlKSB7XG4gICAgY29uc3QgZ2xvYmFsXyA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93O1xuICAgIGNvbnN0IHtcbiAgICAgIHBvbHlmaWxsQ29udGV4dFxuICAgIH0gPSBnbG9iYWxfO1xuXG4gICAgaWYgKHBvbHlmaWxsQ29udGV4dCkge1xuICAgICAgcG9seWZpbGxDb250ZXh0KGdsKTtcbiAgICB9XG5cbiAgICBnbC5zdGF0ZSA9IG5ldyBHTFN0YXRlKGdsLCB7XG4gICAgICBjb3B5U3RhdGVcbiAgICB9KTtcbiAgICBpbnN0YWxsUHJvZ3JhbVNweShnbCk7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBHTF9IT09LRURfU0VUVEVSUykge1xuICAgICAgY29uc3Qgc2V0dGVyID0gR0xfSE9PS0VEX1NFVFRFUlNba2V5XTtcbiAgICAgIGluc3RhbGxTZXR0ZXJTcHkoZ2wsIGtleSwgc2V0dGVyKTtcbiAgICB9XG5cbiAgICBpbnN0YWxsR2V0dGVyT3ZlcnJpZGUoZ2wsICdnZXRQYXJhbWV0ZXInKTtcbiAgICBpbnN0YWxsR2V0dGVyT3ZlcnJpZGUoZ2wsICdpc0VuYWJsZWQnKTtcbiAgfVxuXG4gIGdsLnN0YXRlLmVuYWJsZSA9IGVuYWJsZTtcbiAgcmV0dXJuIGdsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHB1c2hDb250ZXh0U3RhdGUoZ2wpIHtcbiAgaWYgKCFnbC5zdGF0ZSkge1xuICAgIHRyYWNrQ29udGV4dFN0YXRlKGdsLCB7XG4gICAgICBjb3B5U3RhdGU6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBnbC5zdGF0ZS5wdXNoKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gcG9wQ29udGV4dFN0YXRlKGdsKSB7XG4gIGFzc2VydChnbC5zdGF0ZSk7XG4gIGdsLnN0YXRlLnBvcCgpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHJhY2stY29udGV4dC1zdGF0ZS5qcy5tYXAiLCJpbXBvcnQgeyBHTF9QQVJBTUVURVJfREVGQVVMVFMsIEdMX1BBUkFNRVRFUl9TRVRURVJTLCBHTF9DT01QT1NJVEVfUEFSQU1FVEVSX1NFVFRFUlMsIEdMX1BBUkFNRVRFUl9HRVRURVJTIH0gZnJvbSAnLi93ZWJnbC1wYXJhbWV0ZXItdGFibGVzJztcbmltcG9ydCB7IHB1c2hDb250ZXh0U3RhdGUsIHBvcENvbnRleHRTdGF0ZSB9IGZyb20gJy4vdHJhY2stY29udGV4dC1zdGF0ZSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgaXNXZWJHTCB9IGZyb20gJy4uL3V0aWxzL3dlYmdsLWNoZWNrcyc7XG5pbXBvcnQgeyBpc09iamVjdEVtcHR5IH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFBhcmFtZXRlcnMoZ2wsIHZhbHVlcykge1xuICBhc3NlcnQoaXNXZWJHTChnbCksICdzZXRQYXJhbWV0ZXJzIHJlcXVpcmVzIGEgV2ViR0wgY29udGV4dCcpO1xuXG4gIGlmIChpc09iamVjdEVtcHR5KHZhbHVlcykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBjb21wb3NpdGVTZXR0ZXJzID0ge307XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gdmFsdWVzKSB7XG4gICAgY29uc3QgZ2xDb25zdGFudCA9IE51bWJlcihrZXkpO1xuICAgIGNvbnN0IHNldHRlciA9IEdMX1BBUkFNRVRFUl9TRVRURVJTW2tleV07XG5cbiAgICBpZiAoc2V0dGVyKSB7XG4gICAgICBpZiAodHlwZW9mIHNldHRlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29tcG9zaXRlU2V0dGVyc1tzZXR0ZXJdID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldHRlcihnbCwgdmFsdWVzW2tleV0sIGdsQ29uc3RhbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNhY2hlID0gZ2wuc3RhdGUgJiYgZ2wuc3RhdGUuY2FjaGU7XG5cbiAgaWYgKGNhY2hlKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gY29tcG9zaXRlU2V0dGVycykge1xuICAgICAgY29uc3QgY29tcG9zaXRlU2V0dGVyID0gR0xfQ09NUE9TSVRFX1BBUkFNRVRFUl9TRVRURVJTW2tleV07XG4gICAgICBjb21wb3NpdGVTZXR0ZXIoZ2wsIHZhbHVlcywgY2FjaGUpO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtZXRlcnMoZ2wsIHBhcmFtZXRlcnMpIHtcbiAgcGFyYW1ldGVycyA9IHBhcmFtZXRlcnMgfHwgR0xfUEFSQU1FVEVSX0RFRkFVTFRTO1xuXG4gIGlmICh0eXBlb2YgcGFyYW1ldGVycyA9PT0gJ251bWJlcicpIHtcbiAgICBjb25zdCBrZXkgPSBwYXJhbWV0ZXJzO1xuICAgIGNvbnN0IGdldHRlciA9IEdMX1BBUkFNRVRFUl9HRVRURVJTW2tleV07XG4gICAgcmV0dXJuIGdldHRlciA/IGdldHRlcihnbCwga2V5KSA6IGdsLmdldFBhcmFtZXRlcihrZXkpO1xuICB9XG5cbiAgY29uc3QgcGFyYW1ldGVyS2V5cyA9IEFycmF5LmlzQXJyYXkocGFyYW1ldGVycykgPyBwYXJhbWV0ZXJzIDogT2JqZWN0LmtleXMocGFyYW1ldGVycyk7XG4gIGNvbnN0IHN0YXRlID0ge307XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgcGFyYW1ldGVyS2V5cykge1xuICAgIGNvbnN0IGdldHRlciA9IEdMX1BBUkFNRVRFUl9HRVRURVJTW2tleV07XG4gICAgc3RhdGVba2V5XSA9IGdldHRlciA/IGdldHRlcihnbCwgTnVtYmVyKGtleSkpIDogZ2wuZ2V0UGFyYW1ldGVyKE51bWJlcihrZXkpKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXNldFBhcmFtZXRlcnMoZ2wpIHtcbiAgc2V0UGFyYW1ldGVycyhnbCwgR0xfUEFSQU1FVEVSX0RFRkFVTFRTKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3aXRoUGFyYW1ldGVycyhnbCwgcGFyYW1ldGVycywgZnVuYykge1xuICBpZiAoaXNPYmplY3RFbXB0eShwYXJhbWV0ZXJzKSkge1xuICAgIHJldHVybiBmdW5jKGdsKTtcbiAgfVxuXG4gIGNvbnN0IHtcbiAgICBub2NhdGNoID0gdHJ1ZVxuICB9ID0gcGFyYW1ldGVycztcbiAgcHVzaENvbnRleHRTdGF0ZShnbCk7XG4gIHNldFBhcmFtZXRlcnMoZ2wsIHBhcmFtZXRlcnMpO1xuICBsZXQgdmFsdWU7XG5cbiAgaWYgKG5vY2F0Y2gpIHtcbiAgICB2YWx1ZSA9IGZ1bmMoZ2wpO1xuICAgIHBvcENvbnRleHRTdGF0ZShnbCk7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gZnVuYyhnbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHBvcENvbnRleHRTdGF0ZShnbCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dW5pZmllZC1wYXJhbWV0ZXItYXBpLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnLi4vdXRpbHMvd2ViZ2wtY2hlY2tzJztcbmV4cG9ydCBjb25zdCBHTF9QQVJBTUVURVJfREVGQVVMVFMgPSB7XG4gIFszMDQyXTogZmFsc2UsXG4gIFszMjc3M106IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDBdKSxcbiAgWzMyNzc3XTogMzI3NzQsXG4gIFszNDg3N106IDMyNzc0LFxuICBbMzI5NjldOiAxLFxuICBbMzI5NjhdOiAwLFxuICBbMzI5NzFdOiAxLFxuICBbMzI5NzBdOiAwLFxuICBbMzEwNl06IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDBdKSxcbiAgWzMxMDddOiBbdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZV0sXG4gIFsyODg0XTogZmFsc2UsXG4gIFsyODg1XTogMTAyOSxcbiAgWzI5MjldOiBmYWxzZSxcbiAgWzI5MzFdOiAxLFxuICBbMjkzMl06IDUxMyxcbiAgWzI5MjhdOiBuZXcgRmxvYXQzMkFycmF5KFswLCAxXSksXG4gIFsyOTMwXTogdHJ1ZSxcbiAgWzMwMjRdOiB0cnVlLFxuICBbMzYwMDZdOiBudWxsLFxuICBbMjg4Nl06IDIzMDUsXG4gIFszMzE3MF06IDQzNTIsXG4gIFsyODQ5XTogMSxcbiAgWzMyODIzXTogZmFsc2UsXG4gIFszMjgyNF06IDAsXG4gIFsxMDc1Ml06IDAsXG4gIFszMjkzOF06IDEuMCxcbiAgWzMyOTM5XTogZmFsc2UsXG4gIFszMDg5XTogZmFsc2UsXG4gIFszMDg4XTogbmV3IEludDMyQXJyYXkoWzAsIDAsIDEwMjQsIDEwMjRdKSxcbiAgWzI5NjBdOiBmYWxzZSxcbiAgWzI5NjFdOiAwLFxuICBbMjk2OF06IDB4ZmZmZmZmZmYsXG4gIFszNjAwNV06IDB4ZmZmZmZmZmYsXG4gIFsyOTYyXTogNTE5LFxuICBbMjk2N106IDAsXG4gIFsyOTYzXTogMHhmZmZmZmZmZixcbiAgWzM0ODE2XTogNTE5LFxuICBbMzYwMDNdOiAwLFxuICBbMzYwMDRdOiAweGZmZmZmZmZmLFxuICBbMjk2NF06IDc2ODAsXG4gIFsyOTY1XTogNzY4MCxcbiAgWzI5NjZdOiA3NjgwLFxuICBbMzQ4MTddOiA3NjgwLFxuICBbMzQ4MThdOiA3NjgwLFxuICBbMzQ4MTldOiA3NjgwLFxuICBbMjk3OF06IFswLCAwLCAxMDI0LCAxMDI0XSxcbiAgWzMzMzNdOiA0LFxuICBbMzMxN106IDQsXG4gIFszNzQ0MF06IGZhbHNlLFxuICBbMzc0NDFdOiBmYWxzZSxcbiAgWzM3NDQzXTogMzc0NDQsXG4gIFszNTcyM106IDQzNTIsXG4gIFszNjAxMF06IG51bGwsXG4gIFszNTk3N106IGZhbHNlLFxuICBbMzMzMF06IDAsXG4gIFszMzMyXTogMCxcbiAgWzMzMzFdOiAwLFxuICBbMzMxNF06IDAsXG4gIFszMjg3OF06IDAsXG4gIFszMzE2XTogMCxcbiAgWzMzMTVdOiAwLFxuICBbMzI4NzddOiAwXG59O1xuXG5jb25zdCBlbmFibGUgPSAoZ2wsIHZhbHVlLCBrZXkpID0+IHZhbHVlID8gZ2wuZW5hYmxlKGtleSkgOiBnbC5kaXNhYmxlKGtleSk7XG5cbmNvbnN0IGhpbnQgPSAoZ2wsIHZhbHVlLCBrZXkpID0+IGdsLmhpbnQoa2V5LCB2YWx1ZSk7XG5cbmNvbnN0IHBpeGVsU3RvcmVpID0gKGdsLCB2YWx1ZSwga2V5KSA9PiBnbC5waXhlbFN0b3JlaShrZXksIHZhbHVlKTtcblxuY29uc3QgZHJhd0ZyYW1lYnVmZmVyID0gKGdsLCB2YWx1ZSkgPT4ge1xuICBjb25zdCB0YXJnZXQgPSBpc1dlYkdMMihnbCkgPyAzNjAwOSA6IDM2MTYwO1xuICByZXR1cm4gZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgdmFsdWUpO1xufTtcblxuY29uc3QgcmVhZEZyYW1lYnVmZmVyID0gKGdsLCB2YWx1ZSkgPT4ge1xuICByZXR1cm4gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MDA4LCB2YWx1ZSk7XG59O1xuXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFycmF5KSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcoYXJyYXkpO1xufVxuXG5leHBvcnQgY29uc3QgR0xfUEFSQU1FVEVSX1NFVFRFUlMgPSB7XG4gIFszMDQyXTogZW5hYmxlLFxuICBbMzI3NzNdOiAoZ2wsIHZhbHVlKSA9PiBnbC5ibGVuZENvbG9yKC4uLnZhbHVlKSxcbiAgWzMyNzc3XTogJ2JsZW5kRXF1YXRpb24nLFxuICBbMzQ4NzddOiAnYmxlbmRFcXVhdGlvbicsXG4gIFszMjk2OV06ICdibGVuZEZ1bmMnLFxuICBbMzI5NjhdOiAnYmxlbmRGdW5jJyxcbiAgWzMyOTcxXTogJ2JsZW5kRnVuYycsXG4gIFszMjk3MF06ICdibGVuZEZ1bmMnLFxuICBbMzEwNl06IChnbCwgdmFsdWUpID0+IGdsLmNsZWFyQ29sb3IoLi4udmFsdWUpLFxuICBbMzEwN106IChnbCwgdmFsdWUpID0+IGdsLmNvbG9yTWFzayguLi52YWx1ZSksXG4gIFsyODg0XTogZW5hYmxlLFxuICBbMjg4NV06IChnbCwgdmFsdWUpID0+IGdsLmN1bGxGYWNlKHZhbHVlKSxcbiAgWzI5MjldOiBlbmFibGUsXG4gIFsyOTMxXTogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJEZXB0aCh2YWx1ZSksXG4gIFsyOTMyXTogKGdsLCB2YWx1ZSkgPT4gZ2wuZGVwdGhGdW5jKHZhbHVlKSxcbiAgWzI5MjhdOiAoZ2wsIHZhbHVlKSA9PiBnbC5kZXB0aFJhbmdlKC4uLnZhbHVlKSxcbiAgWzI5MzBdOiAoZ2wsIHZhbHVlKSA9PiBnbC5kZXB0aE1hc2sodmFsdWUpLFxuICBbMzAyNF06IGVuYWJsZSxcbiAgWzM1NzIzXTogaGludCxcbiAgWzM2MDA2XTogZHJhd0ZyYW1lYnVmZmVyLFxuICBbMjg4Nl06IChnbCwgdmFsdWUpID0+IGdsLmZyb250RmFjZSh2YWx1ZSksXG4gIFszMzE3MF06IGhpbnQsXG4gIFsyODQ5XTogKGdsLCB2YWx1ZSkgPT4gZ2wubGluZVdpZHRoKHZhbHVlKSxcbiAgWzMyODIzXTogZW5hYmxlLFxuICBbMzI4MjRdOiAncG9seWdvbk9mZnNldCcsXG4gIFsxMDc1Ml06ICdwb2x5Z29uT2Zmc2V0JyxcbiAgWzM1OTc3XTogZW5hYmxlLFxuICBbMzI5MzhdOiAnc2FtcGxlQ292ZXJhZ2UnLFxuICBbMzI5MzldOiAnc2FtcGxlQ292ZXJhZ2UnLFxuICBbMzA4OV06IGVuYWJsZSxcbiAgWzMwODhdOiAoZ2wsIHZhbHVlKSA9PiBnbC5zY2lzc29yKC4uLnZhbHVlKSxcbiAgWzI5NjBdOiBlbmFibGUsXG4gIFsyOTYxXTogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJTdGVuY2lsKHZhbHVlKSxcbiAgWzI5NjhdOiAoZ2wsIHZhbHVlKSA9PiBnbC5zdGVuY2lsTWFza1NlcGFyYXRlKDEwMjgsIHZhbHVlKSxcbiAgWzM2MDA1XTogKGdsLCB2YWx1ZSkgPT4gZ2wuc3RlbmNpbE1hc2tTZXBhcmF0ZSgxMDI5LCB2YWx1ZSksXG4gIFsyOTYyXTogJ3N0ZW5jaWxGdW5jRnJvbnQnLFxuICBbMjk2N106ICdzdGVuY2lsRnVuY0Zyb250JyxcbiAgWzI5NjNdOiAnc3RlbmNpbEZ1bmNGcm9udCcsXG4gIFszNDgxNl06ICdzdGVuY2lsRnVuY0JhY2snLFxuICBbMzYwMDNdOiAnc3RlbmNpbEZ1bmNCYWNrJyxcbiAgWzM2MDA0XTogJ3N0ZW5jaWxGdW5jQmFjaycsXG4gIFsyOTY0XTogJ3N0ZW5jaWxPcEZyb250JyxcbiAgWzI5NjVdOiAnc3RlbmNpbE9wRnJvbnQnLFxuICBbMjk2Nl06ICdzdGVuY2lsT3BGcm9udCcsXG4gIFszNDgxN106ICdzdGVuY2lsT3BCYWNrJyxcbiAgWzM0ODE4XTogJ3N0ZW5jaWxPcEJhY2snLFxuICBbMzQ4MTldOiAnc3RlbmNpbE9wQmFjaycsXG4gIFsyOTc4XTogKGdsLCB2YWx1ZSkgPT4gZ2wudmlld3BvcnQoLi4udmFsdWUpLFxuICBbMzMzM106IHBpeGVsU3RvcmVpLFxuICBbMzMxN106IHBpeGVsU3RvcmVpLFxuICBbMzc0NDBdOiBwaXhlbFN0b3JlaSxcbiAgWzM3NDQxXTogcGl4ZWxTdG9yZWksXG4gIFszNzQ0M106IHBpeGVsU3RvcmVpLFxuICBbMzMzMF06IHBpeGVsU3RvcmVpLFxuICBbMzMzMl06IHBpeGVsU3RvcmVpLFxuICBbMzMzMV06IHBpeGVsU3RvcmVpLFxuICBbMzYwMTBdOiByZWFkRnJhbWVidWZmZXIsXG4gIFszMzE0XTogcGl4ZWxTdG9yZWksXG4gIFszMjg3OF06IHBpeGVsU3RvcmVpLFxuICBbMzMxNl06IHBpeGVsU3RvcmVpLFxuICBbMzMxNV06IHBpeGVsU3RvcmVpLFxuICBbMzI4NzddOiBwaXhlbFN0b3JlaSxcbiAgZnJhbWVidWZmZXI6IChnbCwgZnJhbWVidWZmZXIpID0+IHtcbiAgICBjb25zdCBoYW5kbGUgPSBmcmFtZWJ1ZmZlciAmJiAnaGFuZGxlJyBpbiBmcmFtZWJ1ZmZlciA/IGZyYW1lYnVmZmVyLmhhbmRsZSA6IGZyYW1lYnVmZmVyO1xuICAgIHJldHVybiBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIGhhbmRsZSk7XG4gIH0sXG4gIGJsZW5kOiAoZ2wsIHZhbHVlKSA9PiB2YWx1ZSA/IGdsLmVuYWJsZSgzMDQyKSA6IGdsLmRpc2FibGUoMzA0MiksXG4gIGJsZW5kQ29sb3I6IChnbCwgdmFsdWUpID0+IGdsLmJsZW5kQ29sb3IoLi4udmFsdWUpLFxuICBibGVuZEVxdWF0aW9uOiAoZ2wsIGFyZ3MpID0+IHtcbiAgICBhcmdzID0gaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbYXJncywgYXJnc107XG4gICAgZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKC4uLmFyZ3MpO1xuICB9LFxuICBibGVuZEZ1bmM6IChnbCwgYXJncykgPT4ge1xuICAgIGFyZ3MgPSBpc0FycmF5KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID09PSAyID8gWy4uLmFyZ3MsIC4uLmFyZ3NdIDogYXJncztcbiAgICBnbC5ibGVuZEZ1bmNTZXBhcmF0ZSguLi5hcmdzKTtcbiAgfSxcbiAgY2xlYXJDb2xvcjogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJDb2xvciguLi52YWx1ZSksXG4gIGNsZWFyRGVwdGg6IChnbCwgdmFsdWUpID0+IGdsLmNsZWFyRGVwdGgodmFsdWUpLFxuICBjbGVhclN0ZW5jaWw6IChnbCwgdmFsdWUpID0+IGdsLmNsZWFyU3RlbmNpbCh2YWx1ZSksXG4gIGNvbG9yTWFzazogKGdsLCB2YWx1ZSkgPT4gZ2wuY29sb3JNYXNrKC4uLnZhbHVlKSxcbiAgY3VsbDogKGdsLCB2YWx1ZSkgPT4gdmFsdWUgPyBnbC5lbmFibGUoMjg4NCkgOiBnbC5kaXNhYmxlKDI4ODQpLFxuICBjdWxsRmFjZTogKGdsLCB2YWx1ZSkgPT4gZ2wuY3VsbEZhY2UodmFsdWUpLFxuICBkZXB0aFRlc3Q6IChnbCwgdmFsdWUpID0+IHZhbHVlID8gZ2wuZW5hYmxlKDI5MjkpIDogZ2wuZGlzYWJsZSgyOTI5KSxcbiAgZGVwdGhGdW5jOiAoZ2wsIHZhbHVlKSA9PiBnbC5kZXB0aEZ1bmModmFsdWUpLFxuICBkZXB0aE1hc2s6IChnbCwgdmFsdWUpID0+IGdsLmRlcHRoTWFzayh2YWx1ZSksXG4gIGRlcHRoUmFuZ2U6IChnbCwgdmFsdWUpID0+IGdsLmRlcHRoUmFuZ2UoLi4udmFsdWUpLFxuICBkaXRoZXI6IChnbCwgdmFsdWUpID0+IHZhbHVlID8gZ2wuZW5hYmxlKDMwMjQpIDogZ2wuZGlzYWJsZSgzMDI0KSxcbiAgZGVyaXZhdGl2ZUhpbnQ6IChnbCwgdmFsdWUpID0+IHtcbiAgICBnbC5oaW50KDM1NzIzLCB2YWx1ZSk7XG4gIH0sXG4gIGZyb250RmFjZTogKGdsLCB2YWx1ZSkgPT4gZ2wuZnJvbnRGYWNlKHZhbHVlKSxcbiAgbWlwbWFwSGludDogKGdsLCB2YWx1ZSkgPT4gZ2wuaGludCgzMzE3MCwgdmFsdWUpLFxuICBsaW5lV2lkdGg6IChnbCwgdmFsdWUpID0+IGdsLmxpbmVXaWR0aCh2YWx1ZSksXG4gIHBvbHlnb25PZmZzZXRGaWxsOiAoZ2wsIHZhbHVlKSA9PiB2YWx1ZSA/IGdsLmVuYWJsZSgzMjgyMykgOiBnbC5kaXNhYmxlKDMyODIzKSxcbiAgcG9seWdvbk9mZnNldDogKGdsLCB2YWx1ZSkgPT4gZ2wucG9seWdvbk9mZnNldCguLi52YWx1ZSksXG4gIHNhbXBsZUNvdmVyYWdlOiAoZ2wsIHZhbHVlKSA9PiBnbC5zYW1wbGVDb3ZlcmFnZSguLi52YWx1ZSksXG4gIHNjaXNzb3JUZXN0OiAoZ2wsIHZhbHVlKSA9PiB2YWx1ZSA/IGdsLmVuYWJsZSgzMDg5KSA6IGdsLmRpc2FibGUoMzA4OSksXG4gIHNjaXNzb3I6IChnbCwgdmFsdWUpID0+IGdsLnNjaXNzb3IoLi4udmFsdWUpLFxuICBzdGVuY2lsVGVzdDogKGdsLCB2YWx1ZSkgPT4gdmFsdWUgPyBnbC5lbmFibGUoMjk2MCkgOiBnbC5kaXNhYmxlKDI5NjApLFxuICBzdGVuY2lsTWFzazogKGdsLCB2YWx1ZSkgPT4ge1xuICAgIHZhbHVlID0gaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZSwgdmFsdWVdO1xuICAgIGNvbnN0IFttYXNrLCBiYWNrTWFza10gPSB2YWx1ZTtcbiAgICBnbC5zdGVuY2lsTWFza1NlcGFyYXRlKDEwMjgsIG1hc2spO1xuICAgIGdsLnN0ZW5jaWxNYXNrU2VwYXJhdGUoMTAyOSwgYmFja01hc2spO1xuICB9LFxuICBzdGVuY2lsRnVuYzogKGdsLCBhcmdzKSA9PiB7XG4gICAgYXJncyA9IGlzQXJyYXkoYXJncykgJiYgYXJncy5sZW5ndGggPT09IDMgPyBbLi4uYXJncywgLi4uYXJnc10gOiBhcmdzO1xuICAgIGNvbnN0IFtmdW5jLCByZWYsIG1hc2ssIGJhY2tGdW5jLCBiYWNrUmVmLCBiYWNrTWFza10gPSBhcmdzO1xuICAgIGdsLnN0ZW5jaWxGdW5jU2VwYXJhdGUoMTAyOCwgZnVuYywgcmVmLCBtYXNrKTtcbiAgICBnbC5zdGVuY2lsRnVuY1NlcGFyYXRlKDEwMjksIGJhY2tGdW5jLCBiYWNrUmVmLCBiYWNrTWFzayk7XG4gIH0sXG4gIHN0ZW5jaWxPcDogKGdsLCBhcmdzKSA9PiB7XG4gICAgYXJncyA9IGlzQXJyYXkoYXJncykgJiYgYXJncy5sZW5ndGggPT09IDMgPyBbLi4uYXJncywgLi4uYXJnc10gOiBhcmdzO1xuICAgIGNvbnN0IFtzZmFpbCwgZHBmYWlsLCBkcHBhc3MsIGJhY2tTZmFpbCwgYmFja0RwZmFpbCwgYmFja0RwcGFzc10gPSBhcmdzO1xuICAgIGdsLnN0ZW5jaWxPcFNlcGFyYXRlKDEwMjgsIHNmYWlsLCBkcGZhaWwsIGRwcGFzcyk7XG4gICAgZ2wuc3RlbmNpbE9wU2VwYXJhdGUoMTAyOSwgYmFja1NmYWlsLCBiYWNrRHBmYWlsLCBiYWNrRHBwYXNzKTtcbiAgfSxcbiAgdmlld3BvcnQ6IChnbCwgdmFsdWUpID0+IGdsLnZpZXdwb3J0KC4uLnZhbHVlKVxufTtcblxuZnVuY3Rpb24gZ2V0VmFsdWUoZ2xFbnVtLCB2YWx1ZXMsIGNhY2hlKSB7XG4gIHJldHVybiB2YWx1ZXNbZ2xFbnVtXSAhPT0gdW5kZWZpbmVkID8gdmFsdWVzW2dsRW51bV0gOiBjYWNoZVtnbEVudW1dO1xufVxuXG5leHBvcnQgY29uc3QgR0xfQ09NUE9TSVRFX1BBUkFNRVRFUl9TRVRURVJTID0ge1xuICBibGVuZEVxdWF0aW9uOiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZShnZXRWYWx1ZSgzMjc3NywgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDM0ODc3LCB2YWx1ZXMsIGNhY2hlKSksXG4gIGJsZW5kRnVuYzogKGdsLCB2YWx1ZXMsIGNhY2hlKSA9PiBnbC5ibGVuZEZ1bmNTZXBhcmF0ZShnZXRWYWx1ZSgzMjk2OSwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDMyOTY4LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzI5NzEsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgzMjk3MCwgdmFsdWVzLCBjYWNoZSkpLFxuICBwb2x5Z29uT2Zmc2V0OiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLnBvbHlnb25PZmZzZXQoZ2V0VmFsdWUoMzI4MjQsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgxMDc1MiwgdmFsdWVzLCBjYWNoZSkpLFxuICBzYW1wbGVDb3ZlcmFnZTogKGdsLCB2YWx1ZXMsIGNhY2hlKSA9PiBnbC5zYW1wbGVDb3ZlcmFnZShnZXRWYWx1ZSgzMjkzOCwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDMyOTM5LCB2YWx1ZXMsIGNhY2hlKSksXG4gIHN0ZW5jaWxGdW5jRnJvbnQ6IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wuc3RlbmNpbEZ1bmNTZXBhcmF0ZSgxMDI4LCBnZXRWYWx1ZSgyOTYyLCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMjk2NywgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDI5NjMsIHZhbHVlcywgY2FjaGUpKSxcbiAgc3RlbmNpbEZ1bmNCYWNrOiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLnN0ZW5jaWxGdW5jU2VwYXJhdGUoMTAyOSwgZ2V0VmFsdWUoMzQ4MTYsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgzNjAwMywgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDM2MDA0LCB2YWx1ZXMsIGNhY2hlKSksXG4gIHN0ZW5jaWxPcEZyb250OiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLnN0ZW5jaWxPcFNlcGFyYXRlKDEwMjgsIGdldFZhbHVlKDI5NjQsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgyOTY1LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMjk2NiwgdmFsdWVzLCBjYWNoZSkpLFxuICBzdGVuY2lsT3BCYWNrOiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLnN0ZW5jaWxPcFNlcGFyYXRlKDEwMjksIGdldFZhbHVlKDM0ODE3LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzQ4MTgsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgzNDgxOSwgdmFsdWVzLCBjYWNoZSkpXG59O1xuZXhwb3J0IGNvbnN0IEdMX0hPT0tFRF9TRVRURVJTID0ge1xuICBlbmFibGU6ICh1cGRhdGUsIGNhcGFiaWxpdHkpID0+IHVwZGF0ZSh7XG4gICAgW2NhcGFiaWxpdHldOiB0cnVlXG4gIH0pLFxuICBkaXNhYmxlOiAodXBkYXRlLCBjYXBhYmlsaXR5KSA9PiB1cGRhdGUoe1xuICAgIFtjYXBhYmlsaXR5XTogZmFsc2VcbiAgfSksXG4gIHBpeGVsU3RvcmVpOiAodXBkYXRlLCBwbmFtZSwgdmFsdWUpID0+IHVwZGF0ZSh7XG4gICAgW3BuYW1lXTogdmFsdWVcbiAgfSksXG4gIGhpbnQ6ICh1cGRhdGUsIHBuYW1lLCBoaW50KSA9PiB1cGRhdGUoe1xuICAgIFtwbmFtZV06IGhpbnRcbiAgfSksXG4gIGJpbmRGcmFtZWJ1ZmZlcjogKHVwZGF0ZSwgdGFyZ2V0LCBmcmFtZWJ1ZmZlcikgPT4ge1xuICAgIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgICBjYXNlIDM2MTYwOlxuICAgICAgICByZXR1cm4gdXBkYXRlKHtcbiAgICAgICAgICBbMzYwMDZdOiBmcmFtZWJ1ZmZlcixcbiAgICAgICAgICBbMzYwMTBdOiBmcmFtZWJ1ZmZlclxuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAzNjAwOTpcbiAgICAgICAgcmV0dXJuIHVwZGF0ZSh7XG4gICAgICAgICAgWzM2MDA2XTogZnJhbWVidWZmZXJcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgMzYwMDg6XG4gICAgICAgIHJldHVybiB1cGRhdGUoe1xuICAgICAgICAgIFszNjAxMF06IGZyYW1lYnVmZmVyXG4gICAgICAgIH0pO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIGJsZW5kQ29sb3I6ICh1cGRhdGUsIHIsIGcsIGIsIGEpID0+IHVwZGF0ZSh7XG4gICAgWzMyNzczXTogbmV3IEZsb2F0MzJBcnJheShbciwgZywgYiwgYV0pXG4gIH0pLFxuICBibGVuZEVxdWF0aW9uOiAodXBkYXRlLCBtb2RlKSA9PiB1cGRhdGUoe1xuICAgIFszMjc3N106IG1vZGUsXG4gICAgWzM0ODc3XTogbW9kZVxuICB9KSxcbiAgYmxlbmRFcXVhdGlvblNlcGFyYXRlOiAodXBkYXRlLCBtb2RlUkdCLCBtb2RlQWxwaGEpID0+IHVwZGF0ZSh7XG4gICAgWzMyNzc3XTogbW9kZVJHQixcbiAgICBbMzQ4NzddOiBtb2RlQWxwaGFcbiAgfSksXG4gIGJsZW5kRnVuYzogKHVwZGF0ZSwgc3JjLCBkc3QpID0+IHVwZGF0ZSh7XG4gICAgWzMyOTY5XTogc3JjLFxuICAgIFszMjk2OF06IGRzdCxcbiAgICBbMzI5NzFdOiBzcmMsXG4gICAgWzMyOTcwXTogZHN0XG4gIH0pLFxuICBibGVuZEZ1bmNTZXBhcmF0ZTogKHVwZGF0ZSwgc3JjUkdCLCBkc3RSR0IsIHNyY0FscGhhLCBkc3RBbHBoYSkgPT4gdXBkYXRlKHtcbiAgICBbMzI5NjldOiBzcmNSR0IsXG4gICAgWzMyOTY4XTogZHN0UkdCLFxuICAgIFszMjk3MV06IHNyY0FscGhhLFxuICAgIFszMjk3MF06IGRzdEFscGhhXG4gIH0pLFxuICBjbGVhckNvbG9yOiAodXBkYXRlLCByLCBnLCBiLCBhKSA9PiB1cGRhdGUoe1xuICAgIFszMTA2XTogbmV3IEZsb2F0MzJBcnJheShbciwgZywgYiwgYV0pXG4gIH0pLFxuICBjbGVhckRlcHRoOiAodXBkYXRlLCBkZXB0aCkgPT4gdXBkYXRlKHtcbiAgICBbMjkzMV06IGRlcHRoXG4gIH0pLFxuICBjbGVhclN0ZW5jaWw6ICh1cGRhdGUsIHMpID0+IHVwZGF0ZSh7XG4gICAgWzI5NjFdOiBzXG4gIH0pLFxuICBjb2xvck1hc2s6ICh1cGRhdGUsIHIsIGcsIGIsIGEpID0+IHVwZGF0ZSh7XG4gICAgWzMxMDddOiBbciwgZywgYiwgYV1cbiAgfSksXG4gIGN1bGxGYWNlOiAodXBkYXRlLCBtb2RlKSA9PiB1cGRhdGUoe1xuICAgIFsyODg1XTogbW9kZVxuICB9KSxcbiAgZGVwdGhGdW5jOiAodXBkYXRlLCBmdW5jKSA9PiB1cGRhdGUoe1xuICAgIFsyOTMyXTogZnVuY1xuICB9KSxcbiAgZGVwdGhSYW5nZTogKHVwZGF0ZSwgek5lYXIsIHpGYXIpID0+IHVwZGF0ZSh7XG4gICAgWzI5MjhdOiBuZXcgRmxvYXQzMkFycmF5KFt6TmVhciwgekZhcl0pXG4gIH0pLFxuICBkZXB0aE1hc2s6ICh1cGRhdGUsIG1hc2spID0+IHVwZGF0ZSh7XG4gICAgWzI5MzBdOiBtYXNrXG4gIH0pLFxuICBmcm9udEZhY2U6ICh1cGRhdGUsIGZhY2UpID0+IHVwZGF0ZSh7XG4gICAgWzI4ODZdOiBmYWNlXG4gIH0pLFxuICBsaW5lV2lkdGg6ICh1cGRhdGUsIHdpZHRoKSA9PiB1cGRhdGUoe1xuICAgIFsyODQ5XTogd2lkdGhcbiAgfSksXG4gIHBvbHlnb25PZmZzZXQ6ICh1cGRhdGUsIGZhY3RvciwgdW5pdHMpID0+IHVwZGF0ZSh7XG4gICAgWzMyODI0XTogZmFjdG9yLFxuICAgIFsxMDc1Ml06IHVuaXRzXG4gIH0pLFxuICBzYW1wbGVDb3ZlcmFnZTogKHVwZGF0ZSwgdmFsdWUsIGludmVydCkgPT4gdXBkYXRlKHtcbiAgICBbMzI5MzhdOiB2YWx1ZSxcbiAgICBbMzI5MzldOiBpbnZlcnRcbiAgfSksXG4gIHNjaXNzb3I6ICh1cGRhdGUsIHgsIHksIHdpZHRoLCBoZWlnaHQpID0+IHVwZGF0ZSh7XG4gICAgWzMwODhdOiBuZXcgSW50MzJBcnJheShbeCwgeSwgd2lkdGgsIGhlaWdodF0pXG4gIH0pLFxuICBzdGVuY2lsTWFzazogKHVwZGF0ZSwgbWFzaykgPT4gdXBkYXRlKHtcbiAgICBbMjk2OF06IG1hc2ssXG4gICAgWzM2MDA1XTogbWFza1xuICB9KSxcbiAgc3RlbmNpbE1hc2tTZXBhcmF0ZTogKHVwZGF0ZSwgZmFjZSwgbWFzaykgPT4gdXBkYXRlKHtcbiAgICBbZmFjZSA9PT0gMTAyOCA/IDI5NjggOiAzNjAwNV06IG1hc2tcbiAgfSksXG4gIHN0ZW5jaWxGdW5jOiAodXBkYXRlLCBmdW5jLCByZWYsIG1hc2spID0+IHVwZGF0ZSh7XG4gICAgWzI5NjJdOiBmdW5jLFxuICAgIFsyOTY3XTogcmVmLFxuICAgIFsyOTYzXTogbWFzayxcbiAgICBbMzQ4MTZdOiBmdW5jLFxuICAgIFszNjAwM106IHJlZixcbiAgICBbMzYwMDRdOiBtYXNrXG4gIH0pLFxuICBzdGVuY2lsRnVuY1NlcGFyYXRlOiAodXBkYXRlLCBmYWNlLCBmdW5jLCByZWYsIG1hc2spID0+IHVwZGF0ZSh7XG4gICAgW2ZhY2UgPT09IDEwMjggPyAyOTYyIDogMzQ4MTZdOiBmdW5jLFxuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2NyA6IDM2MDAzXTogcmVmLFxuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2MyA6IDM2MDA0XTogbWFza1xuICB9KSxcbiAgc3RlbmNpbE9wOiAodXBkYXRlLCBmYWlsLCB6ZmFpbCwgenBhc3MpID0+IHVwZGF0ZSh7XG4gICAgWzI5NjRdOiBmYWlsLFxuICAgIFsyOTY1XTogemZhaWwsXG4gICAgWzI5NjZdOiB6cGFzcyxcbiAgICBbMzQ4MTddOiBmYWlsLFxuICAgIFszNDgxOF06IHpmYWlsLFxuICAgIFszNDgxOV06IHpwYXNzXG4gIH0pLFxuICBzdGVuY2lsT3BTZXBhcmF0ZTogKHVwZGF0ZSwgZmFjZSwgZmFpbCwgemZhaWwsIHpwYXNzKSA9PiB1cGRhdGUoe1xuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2NCA6IDM0ODE3XTogZmFpbCxcbiAgICBbZmFjZSA9PT0gMTAyOCA/IDI5NjUgOiAzNDgxOF06IHpmYWlsLFxuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2NiA6IDM0ODE5XTogenBhc3NcbiAgfSksXG4gIHZpZXdwb3J0OiAodXBkYXRlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSA9PiB1cGRhdGUoe1xuICAgIFsyOTc4XTogW3gsIHksIHdpZHRoLCBoZWlnaHRdXG4gIH0pXG59O1xuXG5jb25zdCBpc0VuYWJsZWQgPSAoZ2wsIGtleSkgPT4gZ2wuaXNFbmFibGVkKGtleSk7XG5cbmV4cG9ydCBjb25zdCBHTF9QQVJBTUVURVJfR0VUVEVSUyA9IHtcbiAgWzMwNDJdOiBpc0VuYWJsZWQsXG4gIFsyODg0XTogaXNFbmFibGVkLFxuICBbMjkyOV06IGlzRW5hYmxlZCxcbiAgWzMwMjRdOiBpc0VuYWJsZWQsXG4gIFszMjgyM106IGlzRW5hYmxlZCxcbiAgWzMyOTI2XTogaXNFbmFibGVkLFxuICBbMzI5MjhdOiBpc0VuYWJsZWQsXG4gIFszMDg5XTogaXNFbmFibGVkLFxuICBbMjk2MF06IGlzRW5hYmxlZCxcbiAgWzM1OTc3XTogaXNFbmFibGVkXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViZ2wtcGFyYW1ldGVyLXRhYmxlcy5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdsdW1hLmdsOiBhc3NlcnRpb24gZmFpbGVkLicpO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc3NlcnQuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNzc1RvRGV2aWNlUmF0aW8oZ2wpIHtcbiAgY29uc3Qge1xuICAgIGx1bWFcbiAgfSA9IGdsO1xuXG4gIGlmIChnbC5jYW52YXMgJiYgbHVtYSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNsaWVudFdpZHRoXG4gICAgfSA9IGx1bWEuY2FudmFzU2l6ZUluZm87XG4gICAgcmV0dXJuIGNsaWVudFdpZHRoID8gZ2wuZHJhd2luZ0J1ZmZlcldpZHRoIC8gY2xpZW50V2lkdGggOiAxO1xuICB9XG5cbiAgcmV0dXJuIDE7XG59XG5leHBvcnQgZnVuY3Rpb24gY3NzVG9EZXZpY2VQaXhlbHMoZ2wsIGNzc1BpeGVsLCB5SW52ZXJ0ID0gdHJ1ZSkge1xuICBjb25zdCByYXRpbyA9IGNzc1RvRGV2aWNlUmF0aW8oZ2wpO1xuICBjb25zdCB3aWR0aCA9IGdsLmRyYXdpbmdCdWZmZXJXaWR0aDtcbiAgY29uc3QgaGVpZ2h0ID0gZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgcmV0dXJuIHNjYWxlUGl4ZWxzKGNzc1BpeGVsLCByYXRpbywgd2lkdGgsIGhlaWdodCwgeUludmVydCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlUGl4ZWxSYXRpbyh1c2VEZXZpY2VQaXhlbHMpIHtcbiAgY29uc3Qgd2luZG93UmF0aW8gPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IDEgOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUodXNlRGV2aWNlUGl4ZWxzKSkge1xuICAgIHJldHVybiB1c2VEZXZpY2VQaXhlbHMgPD0gMCA/IDEgOiB1c2VEZXZpY2VQaXhlbHM7XG4gIH1cblxuICByZXR1cm4gdXNlRGV2aWNlUGl4ZWxzID8gd2luZG93UmF0aW8gOiAxO1xufVxuXG5mdW5jdGlvbiBzY2FsZVBpeGVscyhwaXhlbCwgcmF0aW8sIHdpZHRoLCBoZWlnaHQsIHlJbnZlcnQpIHtcbiAgY29uc3QgeCA9IHNjYWxlWChwaXhlbFswXSwgcmF0aW8sIHdpZHRoKTtcbiAgbGV0IHkgPSBzY2FsZVkocGl4ZWxbMV0sIHJhdGlvLCBoZWlnaHQsIHlJbnZlcnQpO1xuICBsZXQgdCA9IHNjYWxlWChwaXhlbFswXSArIDEsIHJhdGlvLCB3aWR0aCk7XG4gIGNvbnN0IHhIaWdoID0gdCA9PT0gd2lkdGggLSAxID8gdCA6IHQgLSAxO1xuICB0ID0gc2NhbGVZKHBpeGVsWzFdICsgMSwgcmF0aW8sIGhlaWdodCwgeUludmVydCk7XG4gIGxldCB5SGlnaDtcblxuICBpZiAoeUludmVydCkge1xuICAgIHQgPSB0ID09PSAwID8gdCA6IHQgKyAxO1xuICAgIHlIaWdoID0geTtcbiAgICB5ID0gdDtcbiAgfSBlbHNlIHtcbiAgICB5SGlnaCA9IHQgPT09IGhlaWdodCAtIDEgPyB0IDogdCAtIDE7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aDogTWF0aC5tYXgoeEhpZ2ggLSB4ICsgMSwgMSksXG4gICAgaGVpZ2h0OiBNYXRoLm1heCh5SGlnaCAtIHkgKyAxLCAxKVxuICB9O1xufVxuXG5mdW5jdGlvbiBzY2FsZVgoeCwgcmF0aW8sIHdpZHRoKSB7XG4gIGNvbnN0IHIgPSBNYXRoLm1pbihNYXRoLnJvdW5kKHggKiByYXRpbyksIHdpZHRoIC0gMSk7XG4gIHJldHVybiByO1xufVxuXG5mdW5jdGlvbiBzY2FsZVkoeSwgcmF0aW8sIGhlaWdodCwgeUludmVydCkge1xuICByZXR1cm4geUludmVydCA/IE1hdGgubWF4KDAsIGhlaWdodCAtIDEgLSBNYXRoLnJvdW5kKHkgKiByYXRpbykpIDogTWF0aC5taW4oTWF0aC5yb3VuZCh5ICogcmF0aW8pLCBoZWlnaHQgLSAxKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRldmljZS1waXhlbHMuanMubWFwIiwiaW1wb3J0IHsgTG9nIH0gZnJvbSAncHJvYmUuZ2wnO1xuZXhwb3J0IGNvbnN0IGxvZyA9IG5ldyBMb2coe1xuICBpZDogJ2x1bWEuZ2wnXG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvZy5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvYmplY3QpIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVlcEFycmF5RXF1YWwoeCwgeSkge1xuICBpZiAoeCA9PT0geSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgaXNBcnJheVggPSBBcnJheS5pc0FycmF5KHgpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh4KTtcbiAgY29uc3QgaXNBcnJheVkgPSBBcnJheS5pc0FycmF5KHkpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh5KTtcblxuICBpZiAoaXNBcnJheVggJiYgaXNBcnJheVkgJiYgeC5sZW5ndGggPT09IHkubGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoeFtpXSAhPT0geVtpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuL2Fzc2VydCc7XG5jb25zdCBFUlJfQ09OVEVYVCA9ICdJbnZhbGlkIFdlYkdMUmVuZGVyaW5nQ29udGV4dCc7XG5leHBvcnQgY29uc3QgRVJSX1dFQkdMID0gRVJSX0NPTlRFWFQ7XG5leHBvcnQgY29uc3QgRVJSX1dFQkdMMiA9ICdSZXF1aXJlcyBXZWJHTDInO1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2ViR0woZ2wpIHtcbiAgaWYgKHR5cGVvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgIT09ICd1bmRlZmluZWQnICYmIGdsIGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAodHlwZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgIT09ICd1bmRlZmluZWQnICYmIGdsIGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIEJvb2xlYW4oZ2wgJiYgTnVtYmVyLmlzRmluaXRlKGdsLl92ZXJzaW9uKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNXZWJHTDIoZ2wpIHtcbiAgaWYgKHR5cGVvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ICE9PSAndW5kZWZpbmVkJyAmJiBnbCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBCb29sZWFuKGdsICYmIGdsLl92ZXJzaW9uID09PSAyKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRXZWJHTDJDb250ZXh0KGdsKSB7XG4gIHJldHVybiBpc1dlYkdMMihnbCkgPyBnbCA6IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0V2ViR0xDb250ZXh0KGdsKSB7XG4gIGFzc2VydChpc1dlYkdMKGdsKSwgRVJSX0NPTlRFWFQpO1xuICByZXR1cm4gZ2w7XG59XG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0V2ViR0wyQ29udGV4dChnbCkge1xuICBhc3NlcnQoaXNXZWJHTDIoZ2wpLCBFUlJfV0VCR0wyKTtcbiAgcmV0dXJuIGdsO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViZ2wtY2hlY2tzLmpzLm1hcCIsImltcG9ydCB7IFZFUlRFWF9TSEFERVIsIEZSQUdNRU5UX1NIQURFUiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IHJlc29sdmVNb2R1bGVzIH0gZnJvbSAnLi9yZXNvbHZlLW1vZHVsZXMnO1xuaW1wb3J0IHsgZ2V0UGxhdGZvcm1TaGFkZXJEZWZpbmVzLCBnZXRWZXJzaW9uRGVmaW5lcyB9IGZyb20gJy4vcGxhdGZvcm0tZGVmaW5lcyc7XG5pbXBvcnQgaW5qZWN0U2hhZGVyLCB7IERFQ0xBUkFUSU9OX0lOSkVDVF9NQVJLRVIgfSBmcm9tICcuL2luamVjdC1zaGFkZXInO1xuaW1wb3J0IHRyYW5zcGlsZVNoYWRlciBmcm9tICcuL3RyYW5zcGlsZS1zaGFkZXInO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMnO1xuY29uc3QgSU5KRUNUX1NIQURFUl9ERUNMQVJBVElPTlMgPSBgXFxuXFxuJHtERUNMQVJBVElPTl9JTkpFQ1RfTUFSS0VSfVxcblxcbmA7XG5jb25zdCBTSEFERVJfVFlQRSA9IHtcbiAgW1ZFUlRFWF9TSEFERVJdOiAndmVydGV4JyxcbiAgW0ZSQUdNRU5UX1NIQURFUl06ICdmcmFnbWVudCdcbn07XG5jb25zdCBGUkFHTUVOVF9TSEFERVJfUFJPTE9HVUUgPSBgXFxcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuYDtcbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZVNoYWRlcnMoZ2wsIG9wdHMpIHtcbiAgY29uc3Qge1xuICAgIHZzLFxuICAgIGZzXG4gIH0gPSBvcHRzO1xuICBjb25zdCBtb2R1bGVzID0gcmVzb2x2ZU1vZHVsZXMob3B0cy5tb2R1bGVzIHx8IFtdKTtcbiAgcmV0dXJuIHtcbiAgICBnbCxcbiAgICB2czogYXNzZW1ibGVTaGFkZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgIHNvdXJjZTogdnMsXG4gICAgICB0eXBlOiBWRVJURVhfU0hBREVSLFxuICAgICAgbW9kdWxlc1xuICAgIH0pKSxcbiAgICBmczogYXNzZW1ibGVTaGFkZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgIHNvdXJjZTogZnMsXG4gICAgICB0eXBlOiBGUkFHTUVOVF9TSEFERVIsXG4gICAgICBtb2R1bGVzXG4gICAgfSkpLFxuICAgIGdldFVuaWZvcm1zOiBhc3NlbWJsZUdldFVuaWZvcm1zKG1vZHVsZXMpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU2hhZGVyKGdsLCB7XG4gIGlkLFxuICBzb3VyY2UsXG4gIHR5cGUsXG4gIG1vZHVsZXMsXG4gIGRlZmluZXMgPSB7fSxcbiAgaG9va0Z1bmN0aW9ucyA9IFtdLFxuICBpbmplY3QgPSB7fSxcbiAgdHJhbnNwaWxlVG9HTFNMMTAwID0gZmFsc2UsXG4gIHByb2xvZ3VlID0gdHJ1ZSxcbiAgbG9nXG59KSB7XG4gIGFzc2VydCh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJywgJ3NoYWRlciBzb3VyY2UgbXVzdCBiZSBhIHN0cmluZycpO1xuICBjb25zdCBpc1ZlcnRleCA9IHR5cGUgPT09IFZFUlRFWF9TSEFERVI7XG4gIGNvbnN0IHNvdXJjZUxpbmVzID0gc291cmNlLnNwbGl0KCdcXG4nKTtcbiAgbGV0IGdsc2xWZXJzaW9uID0gMTAwO1xuICBsZXQgdmVyc2lvbkxpbmUgPSAnJztcbiAgbGV0IGNvcmVTb3VyY2UgPSBzb3VyY2U7XG5cbiAgaWYgKHNvdXJjZUxpbmVzWzBdLmluZGV4T2YoJyN2ZXJzaW9uICcpID09PSAwKSB7XG4gICAgZ2xzbFZlcnNpb24gPSAzMDA7XG4gICAgdmVyc2lvbkxpbmUgPSBzb3VyY2VMaW5lc1swXTtcbiAgICBjb3JlU291cmNlID0gc291cmNlTGluZXMuc2xpY2UoMSkuam9pbignXFxuJyk7XG4gIH0gZWxzZSB7XG4gICAgdmVyc2lvbkxpbmUgPSBgI3ZlcnNpb24gJHtnbHNsVmVyc2lvbn1gO1xuICB9XG5cbiAgY29uc3QgYWxsRGVmaW5lcyA9IHt9O1xuICBtb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICBPYmplY3QuYXNzaWduKGFsbERlZmluZXMsIG1vZHVsZS5nZXREZWZpbmVzKCkpO1xuICB9KTtcbiAgT2JqZWN0LmFzc2lnbihhbGxEZWZpbmVzLCBkZWZpbmVzKTtcbiAgbGV0IGFzc2VtYmxlZFNvdXJjZSA9IHByb2xvZ3VlID8gYFxcXG4ke3ZlcnNpb25MaW5lfVxuJHtnZXRTaGFkZXJOYW1lKHtcbiAgICBpZCxcbiAgICBzb3VyY2UsXG4gICAgdHlwZVxuICB9KX1cbiR7Z2V0U2hhZGVyVHlwZSh7XG4gICAgdHlwZVxuICB9KX1cbiR7Z2V0UGxhdGZvcm1TaGFkZXJEZWZpbmVzKGdsKX1cbiR7Z2V0VmVyc2lvbkRlZmluZXMoZ2wsIGdsc2xWZXJzaW9uLCAhaXNWZXJ0ZXgpfVxuJHtnZXRBcHBsaWNhdGlvbkRlZmluZXMoYWxsRGVmaW5lcyl9XG4ke2lzVmVydGV4ID8gJycgOiBGUkFHTUVOVF9TSEFERVJfUFJPTE9HVUV9XG5gIDogYCR7dmVyc2lvbkxpbmV9XG5gO1xuICBjb25zdCBob29rRnVuY3Rpb25NYXAgPSBub3JtYWxpemVIb29rRnVuY3Rpb25zKGhvb2tGdW5jdGlvbnMpO1xuICBjb25zdCBob29rSW5qZWN0aW9ucyA9IHt9O1xuICBjb25zdCBkZWNsSW5qZWN0aW9ucyA9IHt9O1xuICBjb25zdCBtYWluSW5qZWN0aW9ucyA9IHt9O1xuXG4gIGZvciAoY29uc3Qga2V5IGluIGluamVjdCkge1xuICAgIGNvbnN0IGluamVjdGlvbiA9IHR5cGVvZiBpbmplY3Rba2V5XSA9PT0gJ3N0cmluZycgPyB7XG4gICAgICBpbmplY3Rpb246IGluamVjdFtrZXldLFxuICAgICAgb3JkZXI6IDBcbiAgICB9IDogaW5qZWN0W2tleV07XG4gICAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goL14odnxmKXM6KCMpPyhbXFx3LV0rKSQvKTtcblxuICAgIGlmIChtYXRjaCkge1xuICAgICAgY29uc3QgaGFzaCA9IG1hdGNoWzJdO1xuICAgICAgY29uc3QgbmFtZSA9IG1hdGNoWzNdO1xuXG4gICAgICBpZiAoaGFzaCkge1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2RlY2wnKSB7XG4gICAgICAgICAgZGVjbEluamVjdGlvbnNba2V5XSA9IFtpbmplY3Rpb25dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1haW5JbmplY3Rpb25zW2tleV0gPSBbaW5qZWN0aW9uXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaG9va0luamVjdGlvbnNba2V5XSA9IFtpbmplY3Rpb25dO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYWluSW5qZWN0aW9uc1trZXldID0gW2luamVjdGlvbl07XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgbW9kdWxlcykge1xuICAgIGlmIChsb2cpIHtcbiAgICAgIG1vZHVsZS5jaGVja0RlcHJlY2F0aW9ucyhjb3JlU291cmNlLCBsb2cpO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVNvdXJjZSA9IG1vZHVsZS5nZXRNb2R1bGVTb3VyY2UodHlwZSwgZ2xzbFZlcnNpb24pO1xuICAgIGFzc2VtYmxlZFNvdXJjZSArPSBtb2R1bGVTb3VyY2U7XG4gICAgY29uc3QgaW5qZWN0aW9ucyA9IG1vZHVsZS5pbmplY3Rpb25zW3R5cGVdO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5qZWN0aW9ucykge1xuICAgICAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goL14odnxmKXM6IyhbXFx3LV0rKSQvKTtcblxuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBtYXRjaFsyXTtcbiAgICAgICAgY29uc3QgaW5qZWN0aW9uVHlwZSA9IG5hbWUgPT09ICdkZWNsJyA/IGRlY2xJbmplY3Rpb25zIDogbWFpbkluamVjdGlvbnM7XG4gICAgICAgIGluamVjdGlvblR5cGVba2V5XSA9IGluamVjdGlvblR5cGVba2V5XSB8fCBbXTtcbiAgICAgICAgaW5qZWN0aW9uVHlwZVtrZXldLnB1c2goaW5qZWN0aW9uc1trZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhvb2tJbmplY3Rpb25zW2tleV0gPSBob29rSW5qZWN0aW9uc1trZXldIHx8IFtdO1xuICAgICAgICBob29rSW5qZWN0aW9uc1trZXldLnB1c2goaW5qZWN0aW9uc1trZXldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3NlbWJsZWRTb3VyY2UgKz0gSU5KRUNUX1NIQURFUl9ERUNMQVJBVElPTlM7XG4gIGFzc2VtYmxlZFNvdXJjZSA9IGluamVjdFNoYWRlcihhc3NlbWJsZWRTb3VyY2UsIHR5cGUsIGRlY2xJbmplY3Rpb25zKTtcbiAgYXNzZW1ibGVkU291cmNlICs9IGdldEhvb2tGdW5jdGlvbnMoaG9va0Z1bmN0aW9uTWFwW3R5cGVdLCBob29rSW5qZWN0aW9ucyk7XG4gIGFzc2VtYmxlZFNvdXJjZSArPSBjb3JlU291cmNlO1xuICBhc3NlbWJsZWRTb3VyY2UgPSBpbmplY3RTaGFkZXIoYXNzZW1ibGVkU291cmNlLCB0eXBlLCBtYWluSW5qZWN0aW9ucyk7XG4gIGFzc2VtYmxlZFNvdXJjZSA9IHRyYW5zcGlsZVNoYWRlcihhc3NlbWJsZWRTb3VyY2UsIHRyYW5zcGlsZVRvR0xTTDEwMCA/IDEwMCA6IGdsc2xWZXJzaW9uLCBpc1ZlcnRleCk7XG4gIHJldHVybiBhc3NlbWJsZWRTb3VyY2U7XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlR2V0VW5pZm9ybXMobW9kdWxlcykge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0VW5pZm9ybXMob3B0cykge1xuICAgIGNvbnN0IHVuaWZvcm1zID0ge307XG5cbiAgICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBtb2R1bGVzKSB7XG4gICAgICBjb25zdCBtb2R1bGVVbmlmb3JtcyA9IG1vZHVsZS5nZXRVbmlmb3JtcyhvcHRzLCB1bmlmb3Jtcyk7XG4gICAgICBPYmplY3QuYXNzaWduKHVuaWZvcm1zLCBtb2R1bGVVbmlmb3Jtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaWZvcm1zO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRTaGFkZXJUeXBlKHtcbiAgdHlwZVxufSkge1xuICByZXR1cm4gYFxuI2RlZmluZSBTSEFERVJfVFlQRV8ke1NIQURFUl9UWVBFW3R5cGVdLnRvVXBwZXJDYXNlKCl9XG5gO1xufVxuXG5mdW5jdGlvbiBnZXRTaGFkZXJOYW1lKHtcbiAgaWQsXG4gIHNvdXJjZSxcbiAgdHlwZVxufSkge1xuICBjb25zdCBpbmplY3RTaGFkZXJOYW1lID0gaWQgJiYgdHlwZW9mIGlkID09PSAnc3RyaW5nJyAmJiBzb3VyY2UuaW5kZXhPZignU0hBREVSX05BTUUnKSA9PT0gLTE7XG4gIHJldHVybiBpbmplY3RTaGFkZXJOYW1lID8gYFxuI2RlZmluZSBTSEFERVJfTkFNRSAke2lkfV8ke1NIQURFUl9UWVBFW3R5cGVdfVxuXG5gIDogJyc7XG59XG5cbmZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uRGVmaW5lcyhkZWZpbmVzID0ge30pIHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgbGV0IHNvdXJjZVRleHQgPSAnJztcblxuICBmb3IgKGNvbnN0IGRlZmluZSBpbiBkZWZpbmVzKSB7XG4gICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICBzb3VyY2VUZXh0ICs9ICdcXG4vLyBBUFBMSUNBVElPTiBERUZJTkVTXFxuJztcbiAgICB9XG5cbiAgICBjb3VudCsrO1xuICAgIGNvbnN0IHZhbHVlID0gZGVmaW5lc1tkZWZpbmVdO1xuXG4gICAgaWYgKHZhbHVlIHx8IE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICAgIHNvdXJjZVRleHQgKz0gYCNkZWZpbmUgJHtkZWZpbmUudG9VcHBlckNhc2UoKX0gJHtkZWZpbmVzW2RlZmluZV19XFxuYDtcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPT09IDApIHtcbiAgICBzb3VyY2VUZXh0ICs9ICdcXG4nO1xuICB9XG5cbiAgcmV0dXJuIHNvdXJjZVRleHQ7XG59XG5cbmZ1bmN0aW9uIGdldEhvb2tGdW5jdGlvbnMoaG9va0Z1bmN0aW9ucywgaG9va0luamVjdGlvbnMpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuXG4gIGZvciAoY29uc3QgaG9va05hbWUgaW4gaG9va0Z1bmN0aW9ucykge1xuICAgIGNvbnN0IGhvb2tGdW5jdGlvbiA9IGhvb2tGdW5jdGlvbnNbaG9va05hbWVdO1xuICAgIHJlc3VsdCArPSBgdm9pZCAke2hvb2tGdW5jdGlvbi5zaWduYXR1cmV9IHtcXG5gO1xuXG4gICAgaWYgKGhvb2tGdW5jdGlvbi5oZWFkZXIpIHtcbiAgICAgIHJlc3VsdCArPSBgICAke2hvb2tGdW5jdGlvbi5oZWFkZXJ9YDtcbiAgICB9XG5cbiAgICBpZiAoaG9va0luamVjdGlvbnNbaG9va05hbWVdKSB7XG4gICAgICBjb25zdCBpbmplY3Rpb25zID0gaG9va0luamVjdGlvbnNbaG9va05hbWVdO1xuICAgICAgaW5qZWN0aW9ucy5zb3J0KChhLCBiKSA9PiBhLm9yZGVyIC0gYi5vcmRlcik7XG5cbiAgICAgIGZvciAoY29uc3QgaW5qZWN0aW9uIG9mIGluamVjdGlvbnMpIHtcbiAgICAgICAgcmVzdWx0ICs9IGAgICR7aW5qZWN0aW9uLmluamVjdGlvbn1cXG5gO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChob29rRnVuY3Rpb24uZm9vdGVyKSB7XG4gICAgICByZXN1bHQgKz0gYCAgJHtob29rRnVuY3Rpb24uZm9vdGVyfWA7XG4gICAgfVxuXG4gICAgcmVzdWx0ICs9ICd9XFxuJztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUhvb2tGdW5jdGlvbnMoaG9va0Z1bmN0aW9ucykge1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgdnM6IHt9LFxuICAgIGZzOiB7fVxuICB9O1xuICBob29rRnVuY3Rpb25zLmZvckVhY2goaG9vayA9PiB7XG4gICAgbGV0IG9wdHM7XG5cbiAgICBpZiAodHlwZW9mIGhvb2sgIT09ICdzdHJpbmcnKSB7XG4gICAgICBvcHRzID0gaG9vaztcbiAgICAgIGhvb2sgPSBvcHRzLmhvb2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSB7fTtcbiAgICB9XG5cbiAgICBob29rID0gaG9vay50cmltKCk7XG4gICAgY29uc3QgW3N0YWdlLCBzaWduYXR1cmVdID0gaG9vay5zcGxpdCgnOicpO1xuICAgIGNvbnN0IG5hbWUgPSBob29rLnJlcGxhY2UoL1xcKC4rLywgJycpO1xuICAgIHJlc3VsdFtzdGFnZV1bbmFtZV0gPSBPYmplY3QuYXNzaWduKG9wdHMsIHtcbiAgICAgIHNpZ25hdHVyZVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VtYmxlLXNoYWRlcnMuanMubWFwIiwiZXhwb3J0IGNvbnN0IFZFUlRFWF9TSEFERVIgPSAndnMnO1xuZXhwb3J0IGNvbnN0IEZSQUdNRU5UX1NIQURFUiA9ICdmcyc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25zdGFudHMuanMubWFwIiwiY29uc3QgVFlQRV9ERUZJTklUSU9OUyA9IHtcbiAgbnVtYmVyOiB7XG4gICAgdmFsaWRhdGUodmFsdWUsIHByb3BUeXBlKSB7XG4gICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSAmJiAoISgnbWF4JyBpbiBwcm9wVHlwZSkgfHwgdmFsdWUgPD0gcHJvcFR5cGUubWF4KSAmJiAoISgnbWluJyBpbiBwcm9wVHlwZSkgfHwgdmFsdWUgPj0gcHJvcFR5cGUubWluKTtcbiAgICB9XG5cbiAgfSxcbiAgYXJyYXk6IHtcbiAgICB2YWxpZGF0ZSh2YWx1ZSwgcHJvcFR5cGUpIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpO1xuICAgIH1cblxuICB9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHJvcFR5cGVzKHByb3BEZWZzKSB7XG4gIGNvbnN0IHByb3BUeXBlcyA9IHt9O1xuXG4gIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gcHJvcERlZnMpIHtcbiAgICBjb25zdCBwcm9wRGVmID0gcHJvcERlZnNbcHJvcE5hbWVdO1xuICAgIGNvbnN0IHByb3BUeXBlID0gcGFyc2VQcm9wVHlwZShwcm9wRGVmKTtcbiAgICBwcm9wVHlwZXNbcHJvcE5hbWVdID0gcHJvcFR5cGU7XG4gIH1cblxuICByZXR1cm4gcHJvcFR5cGVzO1xufVxuXG5mdW5jdGlvbiBwYXJzZVByb3BUeXBlKHByb3BEZWYpIHtcbiAgbGV0IHR5cGUgPSBnZXRUeXBlT2YocHJvcERlZik7XG5cbiAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKCFwcm9wRGVmKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCd0eXBlJyBpbiBwcm9wRGVmKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgcHJvcERlZiwgVFlQRV9ERUZJTklUSU9OU1twcm9wRGVmLnR5cGVdKTtcbiAgICB9XG5cbiAgICBpZiAoISgndmFsdWUnIGluIHByb3BEZWYpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgdmFsdWU6IHByb3BEZWZcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdHlwZSA9IGdldFR5cGVPZihwcm9wRGVmLnZhbHVlKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICB0eXBlXG4gICAgfSwgcHJvcERlZiwgVFlQRV9ERUZJTklUSU9OU1t0eXBlXSk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgdHlwZSxcbiAgICB2YWx1ZTogcHJvcERlZlxuICB9LCBUWVBFX0RFRklOSVRJT05TW3R5cGVdKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZU9mKHZhbHVlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHZhbHVlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvcC10eXBlcy5qcy5tYXAiLCJpbXBvcnQgeyBNT0RVTEVfSU5KRUNUT1JTX1ZTLCBNT0RVTEVfSU5KRUNUT1JTX0ZTIH0gZnJvbSAnLi4vbW9kdWxlcy9tb2R1bGUtaW5qZWN0b3JzJztcbmltcG9ydCB7IFZFUlRFWF9TSEFERVIsIEZSQUdNRU5UX1NIQURFUiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IE1PRFVMRV9JTkpFQ1RPUlMgPSB7XG4gIFtWRVJURVhfU0hBREVSXTogTU9EVUxFX0lOSkVDVE9SU19WUyxcbiAgW0ZSQUdNRU5UX1NIQURFUl06IE1PRFVMRV9JTkpFQ1RPUlNfRlNcbn07XG5leHBvcnQgY29uc3QgREVDTEFSQVRJT05fSU5KRUNUX01BUktFUiA9ICdfX0xVTUFfSU5KRUNUX0RFQ0xBUkFUSU9OU19fJztcbmNvbnN0IFJFR0VYX1NUQVJUX09GX01BSU4gPSAvdm9pZFxccyttYWluXFxzKlxcKFteKV0qXFwpXFxzKlxce1xcbj8vO1xuY29uc3QgUkVHRVhfRU5EX09GX01BSU4gPSAvfVxcbj9bXnt9XSokLztcbmNvbnN0IGZyYWdtZW50cyA9IFtdO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5qZWN0U2hhZGVyKHNvdXJjZSwgdHlwZSwgaW5qZWN0LCBpbmplY3RTdGFuZGFyZFN0dWJzID0gZmFsc2UpIHtcbiAgY29uc3QgaXNWZXJ0ZXggPSB0eXBlID09PSBWRVJURVhfU0hBREVSO1xuXG4gIGZvciAoY29uc3Qga2V5IGluIGluamVjdCkge1xuICAgIGNvbnN0IGZyYWdtZW50RGF0YSA9IGluamVjdFtrZXldO1xuICAgIGZyYWdtZW50RGF0YS5zb3J0KChhLCBiKSA9PiBhLm9yZGVyIC0gYi5vcmRlcik7XG4gICAgZnJhZ21lbnRzLmxlbmd0aCA9IGZyYWdtZW50RGF0YS5sZW5ndGg7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZnJhZ21lbnREYXRhLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBmcmFnbWVudHNbaV0gPSBmcmFnbWVudERhdGFbaV0uaW5qZWN0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGZyYWdtZW50U3RyaW5nID0gYCR7ZnJhZ21lbnRzLmpvaW4oJ1xcbicpfVxcbmA7XG5cbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSAndnM6I2RlY2wnOlxuICAgICAgICBpZiAoaXNWZXJ0ZXgpIHtcbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShERUNMQVJBVElPTl9JTkpFQ1RfTUFSS0VSLCBmcmFnbWVudFN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAndnM6I21haW4tc3RhcnQnOlxuICAgICAgICBpZiAoaXNWZXJ0ZXgpIHtcbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShSRUdFWF9TVEFSVF9PRl9NQUlOLCBtYXRjaCA9PiBtYXRjaCArIGZyYWdtZW50U3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd2czojbWFpbi1lbmQnOlxuICAgICAgICBpZiAoaXNWZXJ0ZXgpIHtcbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShSRUdFWF9FTkRfT0ZfTUFJTiwgbWF0Y2ggPT4gZnJhZ21lbnRTdHJpbmcgKyBtYXRjaCk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZnM6I2RlY2wnOlxuICAgICAgICBpZiAoIWlzVmVydGV4KSB7XG4gICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UoREVDTEFSQVRJT05fSU5KRUNUX01BUktFUiwgZnJhZ21lbnRTdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZzOiNtYWluLXN0YXJ0JzpcbiAgICAgICAgaWYgKCFpc1ZlcnRleCkge1xuICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKFJFR0VYX1NUQVJUX09GX01BSU4sIG1hdGNoID0+IG1hdGNoICsgZnJhZ21lbnRTdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZzOiNtYWluLWVuZCc6XG4gICAgICAgIGlmICghaXNWZXJ0ZXgpIHtcbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShSRUdFWF9FTkRfT0ZfTUFJTiwgbWF0Y2ggPT4gZnJhZ21lbnRTdHJpbmcgKyBtYXRjaCk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2Uoa2V5LCBtYXRjaCA9PiBtYXRjaCArIGZyYWdtZW50U3RyaW5nKTtcbiAgICB9XG4gIH1cblxuICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShERUNMQVJBVElPTl9JTkpFQ1RfTUFSS0VSLCAnJyk7XG5cbiAgaWYgKGluamVjdFN0YW5kYXJkU3R1YnMpIHtcbiAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXFx9XFxzKiQvLCBtYXRjaCA9PiBtYXRjaCArIE1PRFVMRV9JTkpFQ1RPUlNbdHlwZV0pO1xuICB9XG5cbiAgcmV0dXJuIHNvdXJjZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lSW5qZWN0cyhpbmplY3RzKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuICBhc3NlcnQoQXJyYXkuaXNBcnJheShpbmplY3RzKSAmJiBpbmplY3RzLmxlbmd0aCA+IDEpO1xuICBpbmplY3RzLmZvckVhY2goaW5qZWN0ID0+IHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbmplY3QpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0W2tleV0gPyBgJHtyZXN1bHRba2V5XX1cXG4ke2luamVjdFtrZXldfWAgOiBpbmplY3Rba2V5XTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5qZWN0LXNoYWRlci5qcy5tYXAiLCJpbXBvcnQgeyBnZXRDb250ZXh0SW5mbywgaGFzRmVhdHVyZXMsIGNhbkNvbXBpbGVHTEdTRXh0ZW5zaW9uLCBGRUFUVVJFUyB9IGZyb20gJy4uL3V0aWxzL3dlYmdsLWluZm8nO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXRmb3JtU2hhZGVyRGVmaW5lcyhnbCkge1xuICBjb25zdCBkZWJ1Z0luZm8gPSBnZXRDb250ZXh0SW5mbyhnbCk7XG5cbiAgc3dpdGNoIChkZWJ1Z0luZm8uZ3B1VmVuZG9yLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdudmlkaWEnOlxuICAgICAgcmV0dXJuIGBcXFxuI2RlZmluZSBOVklESUFfR1BVXG4vLyBOdmlkaWEgb3B0aW1pemVzIGF3YXkgdGhlIGNhbGN1bGF0aW9uIG5lY2Vzc2FyeSBmb3IgZW11bGF0ZWQgZnA2NFxuI2RlZmluZSBMVU1BX0ZQNjRfQ09ERV9FTElNSU5BVElPTl9XT1JLQVJPVU5EIDFcbmA7XG5cbiAgICBjYXNlICdpbnRlbCc6XG4gICAgICByZXR1cm4gYFxcXG4jZGVmaW5lIElOVEVMX0dQVVxuLy8gSW50ZWwgb3B0aW1pemVzIGF3YXkgdGhlIGNhbGN1bGF0aW9uIG5lY2Vzc2FyeSBmb3IgZW11bGF0ZWQgZnA2NFxuI2RlZmluZSBMVU1BX0ZQNjRfQ09ERV9FTElNSU5BVElPTl9XT1JLQVJPVU5EIDFcbi8vIEludGVsJ3MgYnVpbHQtaW4gJ3RhbicgZnVuY3Rpb24gZG9lc24ndCBoYXZlIGFjY2VwdGFibGUgcHJlY2lzaW9uXG4jZGVmaW5lIExVTUFfRlAzMl9UQU5fUFJFQ0lTSU9OX1dPUktBUk9VTkQgMVxuLy8gSW50ZWwgR1BVIGRvZXNuJ3QgaGF2ZSBmdWxsIDMyIGJpdHMgcHJlY2lzaW9uIGluIHNhbWUgY2FzZXMsIGNhdXNlcyBvdmVyZmxvd1xuI2RlZmluZSBMVU1BX0ZQNjRfSElHSF9CSVRTX09WRVJGTE9XX1dPUktBUk9VTkQgMVxuYDtcblxuICAgIGNhc2UgJ2FtZCc6XG4gICAgICByZXR1cm4gYFxcXG4jZGVmaW5lIEFNRF9HUFVcbmA7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGBcXFxuI2RlZmluZSBERUZBVUxUX0dQVVxuLy8gUHJldmVudCBkcml2ZXIgZnJvbSBvcHRpbWl6aW5nIGF3YXkgdGhlIGNhbGN1bGF0aW9uIG5lY2Vzc2FyeSBmb3IgZW11bGF0ZWQgZnA2NFxuI2RlZmluZSBMVU1BX0ZQNjRfQ09ERV9FTElNSU5BVElPTl9XT1JLQVJPVU5EIDFcbi8vIEludGVsJ3MgYnVpbHQtaW4gJ3RhbicgZnVuY3Rpb24gZG9lc24ndCBoYXZlIGFjY2VwdGFibGUgcHJlY2lzaW9uXG4jZGVmaW5lIExVTUFfRlAzMl9UQU5fUFJFQ0lTSU9OX1dPUktBUk9VTkQgMVxuLy8gSW50ZWwgR1BVIGRvZXNuJ3QgaGF2ZSBmdWxsIDMyIGJpdHMgcHJlY2lzaW9uIGluIHNhbWUgY2FzZXMsIGNhdXNlcyBvdmVyZmxvd1xuI2RlZmluZSBMVU1BX0ZQNjRfSElHSF9CSVRTX09WRVJGTE9XX1dPUktBUk9VTkQgMVxuYDtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnNpb25EZWZpbmVzKGdsLCBnbHNsVmVyc2lvbiwgaXNGcmFnbWVudCkge1xuICBsZXQgdmVyc2lvbkRlZmluZXMgPSBgXFxcbiNpZiAoX19WRVJTSU9OX18gPiAxMjApXG5cbiMgZGVmaW5lIEZFQVRVUkVfR0xTTF9ERVJJVkFUSVZFU1xuIyBkZWZpbmUgRkVBVFVSRV9HTFNMX0RSQVdfQlVGRkVSU1xuIyBkZWZpbmUgRkVBVFVSRV9HTFNMX0ZSQUdfREVQVEhcbiMgZGVmaW5lIEZFQVRVUkVfR0xTTF9URVhUVVJFX0xPRFxuXG4vLyBERVBSRUNBVEVEIEZMQUdTLCByZW1vdmUgaW4gdjlcbiMgZGVmaW5lIEZSQUdfREVQVEhcbiMgZGVmaW5lIERFUklWQVRJVkVTXG4jIGRlZmluZSBEUkFXX0JVRkZFUlNcbiMgZGVmaW5lIFRFWFRVUkVfTE9EXG5cbiNlbmRpZiAvLyBfX1ZFUlNJT05cbmA7XG5cbiAgaWYgKGhhc0ZlYXR1cmVzKGdsLCBGRUFUVVJFUy5HTFNMX0ZSQUdfREVQVEgpKSB7XG4gICAgdmVyc2lvbkRlZmluZXMgKz0gYFxcXG5cbi8vIEZSQUdfREVQVEggPT4gZ2xfRnJhZ0RlcHRoIGlzIGF2YWlsYWJsZVxuI2lmZGVmIEdMX0VYVF9mcmFnX2RlcHRoXG4jZXh0ZW5zaW9uIEdMX0VYVF9mcmFnX2RlcHRoIDogZW5hYmxlXG4jIGRlZmluZSBGRUFUVVJFX0dMU0xfRlJBR19ERVBUSFxuIyBkZWZpbmUgRlJBR19ERVBUSFxuIyBkZWZpbmUgZ2xfRnJhZ0RlcHRoIGdsX0ZyYWdEZXB0aEVYVFxuI2VuZGlmXG5gO1xuICB9XG5cbiAgaWYgKGhhc0ZlYXR1cmVzKGdsLCBGRUFUVVJFUy5HTFNMX0RFUklWQVRJVkVTKSAmJiBjYW5Db21waWxlR0xHU0V4dGVuc2lvbihnbCwgRkVBVFVSRVMuR0xTTF9ERVJJVkFUSVZFUykpIHtcbiAgICB2ZXJzaW9uRGVmaW5lcyArPSBgXFxcblxuLy8gREVSSVZBVElWRVMgPT4gZHhkRiwgZHhkWSBhbmQgZndpZHRoIGFyZSBhdmFpbGFibGVcbiNpZmRlZiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXNcbiNleHRlbnNpb24gR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzIDogZW5hYmxlXG4jIGRlZmluZSBGRUFUVVJFX0dMU0xfREVSSVZBVElWRVNcbiMgZGVmaW5lIERFUklWQVRJVkVTXG4jZW5kaWZcbmA7XG4gIH1cblxuICBpZiAoaGFzRmVhdHVyZXMoZ2wsIEZFQVRVUkVTLkdMU0xfRlJBR19EQVRBKSAmJiBjYW5Db21waWxlR0xHU0V4dGVuc2lvbihnbCwgRkVBVFVSRVMuR0xTTF9GUkFHX0RBVEEsIHtcbiAgICBiZWhhdmlvcjogJ3JlcXVpcmUnXG4gIH0pKSB7XG4gICAgdmVyc2lvbkRlZmluZXMgKz0gYFxcXG5cbi8vIERSQVdfQlVGRkVSUyA9PiBnbF9GcmFnRGF0YVtdIGlzIGF2YWlsYWJsZVxuI2lmZGVmIEdMX0VYVF9kcmF3X2J1ZmZlcnNcbiNleHRlbnNpb24gR0xfRVhUX2RyYXdfYnVmZmVycyA6IHJlcXVpcmVcbiNkZWZpbmUgRkVBVFVSRV9HTFNMX0RSQVdfQlVGRkVSU1xuI2RlZmluZSBEUkFXX0JVRkZFUlNcbiNlbmRpZlxuYDtcbiAgfVxuXG4gIGlmIChoYXNGZWF0dXJlcyhnbCwgRkVBVFVSRVMuR0xTTF9URVhUVVJFX0xPRCkpIHtcbiAgICB2ZXJzaW9uRGVmaW5lcyArPSBgXFxcbi8vIFRFWFRVUkVfTE9EID0+IHRleHR1cmUyRExvZCBldGMgYXJlIGF2YWlsYWJsZVxuI2lmZGVmIEdMX0VYVF9zaGFkZXJfdGV4dHVyZV9sb2RcbiNleHRlbnNpb24gR0xfRVhUX3NoYWRlcl90ZXh0dXJlX2xvZCA6IGVuYWJsZVxuXG4jIGRlZmluZSBGRUFUVVJFX0dMU0xfVEVYVFVSRV9MT0RcbiMgZGVmaW5lIFRFWFRVUkVfTE9EXG5cbiNlbmRpZlxuYDtcbiAgfVxuXG4gIHJldHVybiB2ZXJzaW9uRGVmaW5lcztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBsYXRmb3JtLWRlZmluZXMuanMubWFwIiwiaW1wb3J0IFNoYWRlck1vZHVsZSBmcm9tICcuL3NoYWRlci1tb2R1bGUnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVNb2R1bGVzKG1vZHVsZXMpIHtcbiAgcmV0dXJuIGdldFNoYWRlckRlcGVuZGVuY2llcyhpbnN0YW50aWF0ZU1vZHVsZXMobW9kdWxlcykpO1xufVxuXG5mdW5jdGlvbiBnZXRTaGFkZXJEZXBlbmRlbmNpZXMobW9kdWxlcykge1xuICBjb25zdCBtb2R1bGVNYXAgPSB7fTtcbiAgY29uc3QgbW9kdWxlRGVwdGggPSB7fTtcbiAgZ2V0RGVwZW5kZW5jeUdyYXBoKHtcbiAgICBtb2R1bGVzLFxuICAgIGxldmVsOiAwLFxuICAgIG1vZHVsZU1hcCxcbiAgICBtb2R1bGVEZXB0aFxuICB9KTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG1vZHVsZURlcHRoKS5zb3J0KChhLCBiKSA9PiBtb2R1bGVEZXB0aFtiXSAtIG1vZHVsZURlcHRoW2FdKS5tYXAobmFtZSA9PiBtb2R1bGVNYXBbbmFtZV0pO1xufVxuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmN5R3JhcGgoe1xuICBtb2R1bGVzLFxuICBsZXZlbCxcbiAgbW9kdWxlTWFwLFxuICBtb2R1bGVEZXB0aFxufSkge1xuICBpZiAobGV2ZWwgPj0gNSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUG9zc2libGUgbG9vcCBpbiBzaGFkZXIgZGVwZW5kZW5jeSBncmFwaCcpO1xuICB9XG5cbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgbW9kdWxlcykge1xuICAgIG1vZHVsZU1hcFttb2R1bGUubmFtZV0gPSBtb2R1bGU7XG5cbiAgICBpZiAobW9kdWxlRGVwdGhbbW9kdWxlLm5hbWVdID09PSB1bmRlZmluZWQgfHwgbW9kdWxlRGVwdGhbbW9kdWxlLm5hbWVdIDwgbGV2ZWwpIHtcbiAgICAgIG1vZHVsZURlcHRoW21vZHVsZS5uYW1lXSA9IGxldmVsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgbW9kdWxlIG9mIG1vZHVsZXMpIHtcbiAgICBpZiAobW9kdWxlLmRlcGVuZGVuY2llcykge1xuICAgICAgZ2V0RGVwZW5kZW5jeUdyYXBoKHtcbiAgICAgICAgbW9kdWxlczogbW9kdWxlLmRlcGVuZGVuY2llcyxcbiAgICAgICAgbGV2ZWw6IGxldmVsICsgMSxcbiAgICAgICAgbW9kdWxlTWFwLFxuICAgICAgICBtb2R1bGVEZXB0aFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluc3RhbnRpYXRlTW9kdWxlcyhtb2R1bGVzLCBzZWVuKSB7XG4gIHJldHVybiBtb2R1bGVzLm1hcChtb2R1bGUgPT4ge1xuICAgIGlmIChtb2R1bGUgaW5zdGFuY2VvZiBTaGFkZXJNb2R1bGUpIHtcbiAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfVxuXG4gICAgYXNzZXJ0KHR5cGVvZiBtb2R1bGUgIT09ICdzdHJpbmcnLCBgU2hhZGVyIG1vZHVsZSB1c2UgYnkgbmFtZSBpcyBkZXByZWNhdGVkLiBJbXBvcnQgc2hhZGVyIG1vZHVsZSAnJHttb2R1bGV9JyBhbmQgdXNlIGl0IGRpcmVjdGx5LmApO1xuICAgIGFzc2VydChtb2R1bGUubmFtZSwgJ3NoYWRlciBtb2R1bGUgaGFzIG5vIG5hbWUnKTtcbiAgICBtb2R1bGUgPSBuZXcgU2hhZGVyTW9kdWxlKG1vZHVsZSk7XG4gICAgbW9kdWxlLmRlcGVuZGVuY2llcyA9IGluc3RhbnRpYXRlTW9kdWxlcyhtb2R1bGUuZGVwZW5kZW5jaWVzKTtcbiAgICByZXR1cm4gbW9kdWxlO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IFRFU1RfRVhQT1JUUyA9IHtcbiAgZ2V0U2hhZGVyRGVwZW5kZW5jaWVzLFxuICBnZXREZXBlbmRlbmN5R3JhcGhcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXNvbHZlLW1vZHVsZXMuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgcGFyc2VQcm9wVHlwZXMgfSBmcm9tICcuL2ZpbHRlcnMvcHJvcC10eXBlcyc7XG5jb25zdCBWRVJURVhfU0hBREVSID0gJ3ZzJztcbmNvbnN0IEZSQUdNRU5UX1NIQURFUiA9ICdmcyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFkZXJNb2R1bGUge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgbmFtZSxcbiAgICB2cyxcbiAgICBmcyxcbiAgICBkZXBlbmRlbmNpZXMgPSBbXSxcbiAgICB1bmlmb3JtcyxcbiAgICBnZXRVbmlmb3JtcyxcbiAgICBkZXByZWNhdGlvbnMgPSBbXSxcbiAgICBkZWZpbmVzID0ge30sXG4gICAgaW5qZWN0ID0ge30sXG4gICAgdmVydGV4U2hhZGVyLFxuICAgIGZyYWdtZW50U2hhZGVyXG4gIH0pIHtcbiAgICBhc3NlcnQodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudnMgPSB2cyB8fCB2ZXJ0ZXhTaGFkZXI7XG4gICAgdGhpcy5mcyA9IGZzIHx8IGZyYWdtZW50U2hhZGVyO1xuICAgIHRoaXMuZ2V0TW9kdWxlVW5pZm9ybXMgPSBnZXRVbmlmb3JtcztcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcztcbiAgICB0aGlzLmRlcHJlY2F0aW9ucyA9IHRoaXMuX3BhcnNlRGVwcmVjYXRpb25EZWZpbml0aW9ucyhkZXByZWNhdGlvbnMpO1xuICAgIHRoaXMuZGVmaW5lcyA9IGRlZmluZXM7XG4gICAgdGhpcy5pbmplY3Rpb25zID0gbm9ybWFsaXplSW5qZWN0aW9ucyhpbmplY3QpO1xuXG4gICAgaWYgKHVuaWZvcm1zKSB7XG4gICAgICB0aGlzLnVuaWZvcm1zID0gcGFyc2VQcm9wVHlwZXModW5pZm9ybXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZHVsZVNvdXJjZSh0eXBlKSB7XG4gICAgbGV0IG1vZHVsZVNvdXJjZTtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBWRVJURVhfU0hBREVSOlxuICAgICAgICBtb2R1bGVTb3VyY2UgPSB0aGlzLnZzIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGUkFHTUVOVF9TSEFERVI6XG4gICAgICAgIG1vZHVsZVNvdXJjZSA9IHRoaXMuZnMgfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBgXFxcbiNkZWZpbmUgTU9EVUxFXyR7dGhpcy5uYW1lLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW14wLTlhLXpdL2dpLCAnXycpfVxuJHttb2R1bGVTb3VyY2V9XFxcbi8vIEVORCBNT0RVTEVfJHt0aGlzLm5hbWV9XG5cbmA7XG4gIH1cblxuICBnZXRVbmlmb3JtcyhvcHRzLCB1bmlmb3Jtcykge1xuICAgIGlmICh0aGlzLmdldE1vZHVsZVVuaWZvcm1zKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRNb2R1bGVVbmlmb3JtcyhvcHRzLCB1bmlmb3Jtcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudW5pZm9ybXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kZWZhdWx0R2V0VW5pZm9ybXMob3B0cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgZ2V0RGVmaW5lcygpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZpbmVzO1xuICB9XG5cbiAgY2hlY2tEZXByZWNhdGlvbnMoc2hhZGVyU291cmNlLCBsb2cpIHtcbiAgICB0aGlzLmRlcHJlY2F0aW9ucy5mb3JFYWNoKGRlZiA9PiB7XG4gICAgICBpZiAoZGVmLnJlZ2V4LnRlc3Qoc2hhZGVyU291cmNlKSkge1xuICAgICAgICBpZiAoZGVmLmRlcHJlY2F0ZWQpIHtcbiAgICAgICAgICBsb2cuZGVwcmVjYXRlZChkZWYub2xkLCBkZWYubmV3KSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZy5yZW1vdmVkKGRlZi5vbGQsIGRlZi5uZXcpKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9wYXJzZURlcHJlY2F0aW9uRGVmaW5pdGlvbnMoZGVwcmVjYXRpb25zKSB7XG4gICAgZGVwcmVjYXRpb25zLmZvckVhY2goZGVmID0+IHtcbiAgICAgIHN3aXRjaCAoZGVmLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgIGRlZi5yZWdleCA9IG5ldyBSZWdFeHAoYFxcXFxiJHtkZWYub2xkfVxcXFwoYCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBkZWYucmVnZXggPSBuZXcgUmVnRXhwKGAke2RlZi50eXBlfSAke2RlZi5vbGR9O2ApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZXByZWNhdGlvbnM7XG4gIH1cblxuICBfZGVmYXVsdEdldFVuaWZvcm1zKG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHVuaWZvcm1zID0ge307XG4gICAgY29uc3QgcHJvcFR5cGVzID0gdGhpcy51bmlmb3JtcztcblxuICAgIGZvciAoY29uc3Qga2V5IGluIHByb3BUeXBlcykge1xuICAgICAgY29uc3QgcHJvcERlZiA9IHByb3BUeXBlc1trZXldO1xuXG4gICAgICBpZiAoa2V5IGluIG9wdHMgJiYgIXByb3BEZWYucHJpdmF0ZSkge1xuICAgICAgICBpZiAocHJvcERlZi52YWxpZGF0ZSkge1xuICAgICAgICAgIGFzc2VydChwcm9wRGVmLnZhbGlkYXRlKG9wdHNba2V5XSwgcHJvcERlZiksIGAke3RoaXMubmFtZX06IGludmFsaWQgJHtrZXl9YCk7XG4gICAgICAgIH1cblxuICAgICAgICB1bmlmb3Jtc1trZXldID0gb3B0c1trZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW5pZm9ybXNba2V5XSA9IHByb3BEZWYudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaWZvcm1zO1xuICB9XG5cbn1cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTaGFkZXJNb2R1bGUobW9kdWxlKSB7XG4gIGlmICghbW9kdWxlLm5vcm1hbGl6ZWQpIHtcbiAgICBtb2R1bGUubm9ybWFsaXplZCA9IHRydWU7XG5cbiAgICBpZiAobW9kdWxlLnVuaWZvcm1zICYmICFtb2R1bGUuZ2V0VW5pZm9ybXMpIHtcbiAgICAgIGNvbnN0IHNoYWRlck1vZHVsZSA9IG5ldyBTaGFkZXJNb2R1bGUobW9kdWxlKTtcbiAgICAgIG1vZHVsZS5nZXRVbmlmb3JtcyA9IHNoYWRlck1vZHVsZS5nZXRVbmlmb3Jtcy5iaW5kKHNoYWRlck1vZHVsZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1vZHVsZTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSW5qZWN0aW9ucyhpbmplY3Rpb25zKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICB2czoge30sXG4gICAgZnM6IHt9XG4gIH07XG5cbiAgZm9yIChjb25zdCBob29rIGluIGluamVjdGlvbnMpIHtcbiAgICBsZXQgaW5qZWN0aW9uID0gaW5qZWN0aW9uc1tob29rXTtcbiAgICBjb25zdCBzdGFnZSA9IGhvb2suc2xpY2UoMCwgMik7XG5cbiAgICBpZiAodHlwZW9mIGluamVjdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGluamVjdGlvbiA9IHtcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICAgIGluamVjdGlvblxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXN1bHRbc3RhZ2VdW2hvb2tdID0gaW5qZWN0aW9uO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNoYWRlci1tb2R1bGUuanMubWFwIiwiZnVuY3Rpb24gdGVzdFZhcmlhYmxlKHF1YWxpZmllcikge1xuICByZXR1cm4gbmV3IFJlZ0V4cChgXFxcXGIke3F1YWxpZmllcn1bIFxcXFx0XSsoXFxcXHcrWyBcXFxcdF0rXFxcXHcrKFxcXFxbXFxcXHcrXFxcXF0pPzspYCwgJ2cnKTtcbn1cblxuY29uc3QgRVMzMDBfUkVQTEFDRU1FTlRTID0gW1svXigjdmVyc2lvblsgXFx0XSsoMTAwfDMwMFsgXFx0XStlcykpP1sgXFx0XSpcXG4vLCAnI3ZlcnNpb24gMzAwIGVzXFxuJ10sIFsvXFxidGV4dHVyZSgyRHwyRFByb2p8Q3ViZSlMb2QoRVhUKT9cXCgvZywgJ3RleHR1cmVMb2QoJ10sIFsvXFxidGV4dHVyZSgyRHwyRFByb2p8Q3ViZSkoRVhUKT9cXCgvZywgJ3RleHR1cmUoJ11dO1xuY29uc3QgRVMzMDBfVkVSVEVYX1JFUExBQ0VNRU5UUyA9IFsuLi5FUzMwMF9SRVBMQUNFTUVOVFMsIFt0ZXN0VmFyaWFibGUoJ2F0dHJpYnV0ZScpLCAnaW4gJDEnXSwgW3Rlc3RWYXJpYWJsZSgndmFyeWluZycpLCAnb3V0ICQxJ11dO1xuY29uc3QgRVMzMDBfRlJBR01FTlRfUkVQTEFDRU1FTlRTID0gWy4uLkVTMzAwX1JFUExBQ0VNRU5UUywgW3Rlc3RWYXJpYWJsZSgndmFyeWluZycpLCAnaW4gJDEnXV07XG5jb25zdCBFUzEwMF9SRVBMQUNFTUVOVFMgPSBbWy9eI3ZlcnNpb25bIFxcdF0rMzAwWyBcXHRdK2VzLywgJyN2ZXJzaW9uIDEwMCddLCBbL1xcYnRleHR1cmUoMkR8MkRQcm9qfEN1YmUpTG9kXFwoL2csICd0ZXh0dXJlJDFMb2RFWFQoJ10sIFsvXFxidGV4dHVyZVxcKC9nLCAndGV4dHVyZTJEKCddLCBbL1xcYnRleHR1cmVMb2RcXCgvZywgJ3RleHR1cmUyRExvZEVYVCgnXV07XG5jb25zdCBFUzEwMF9WRVJURVhfUkVQTEFDRU1FTlRTID0gWy4uLkVTMTAwX1JFUExBQ0VNRU5UUywgW3Rlc3RWYXJpYWJsZSgnaW4nKSwgJ2F0dHJpYnV0ZSAkMSddLCBbdGVzdFZhcmlhYmxlKCdvdXQnKSwgJ3ZhcnlpbmcgJDEnXV07XG5jb25zdCBFUzEwMF9GUkFHTUVOVF9SRVBMQUNFTUVOVFMgPSBbLi4uRVMxMDBfUkVQTEFDRU1FTlRTLCBbdGVzdFZhcmlhYmxlKCdpbicpLCAndmFyeWluZyAkMSddXTtcbmNvbnN0IEVTMTAwX0ZSQUdNRU5UX09VVFBVVF9OQU1FID0gJ2dsX0ZyYWdDb2xvcic7XG5jb25zdCBFUzMwMF9GUkFHTUVOVF9PVVRQVVRfUkVHRVggPSAvXFxib3V0WyBcXHRdK3ZlYzRbIFxcdF0rKFxcdyspWyBcXHRdKjtcXG4/LztcbmNvbnN0IFJFR0VYX1NUQVJUX09GX01BSU4gPSAvdm9pZFxccyttYWluXFxzKlxcKFteKV0qXFwpXFxzKlxce1xcbj8vO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlU2hhZGVyKHNvdXJjZSwgdGFyZ2V0R0xTTFZlcnNpb24sIGlzVmVydGV4KSB7XG4gIHN3aXRjaCAodGFyZ2V0R0xTTFZlcnNpb24pIHtcbiAgICBjYXNlIDMwMDpcbiAgICAgIHJldHVybiBpc1ZlcnRleCA/IGNvbnZlcnRTaGFkZXIoc291cmNlLCBFUzMwMF9WRVJURVhfUkVQTEFDRU1FTlRTKSA6IGNvbnZlcnRGcmFnbWVudFNoYWRlclRvMzAwKHNvdXJjZSk7XG5cbiAgICBjYXNlIDEwMDpcbiAgICAgIHJldHVybiBpc1ZlcnRleCA/IGNvbnZlcnRTaGFkZXIoc291cmNlLCBFUzEwMF9WRVJURVhfUkVQTEFDRU1FTlRTKSA6IGNvbnZlcnRGcmFnbWVudFNoYWRlclRvMTAwKHNvdXJjZSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmtub3duIEdMU0wgdmVyc2lvbiAke3RhcmdldEdMU0xWZXJzaW9ufWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRTaGFkZXIoc291cmNlLCByZXBsYWNlbWVudHMpIHtcbiAgZm9yIChjb25zdCBbcGF0dGVybiwgcmVwbGFjZW1lbnRdIG9mIHJlcGxhY2VtZW50cykge1xuICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKHBhdHRlcm4sIHJlcGxhY2VtZW50KTtcbiAgfVxuXG4gIHJldHVybiBzb3VyY2U7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGcmFnbWVudFNoYWRlclRvMzAwKHNvdXJjZSkge1xuICBzb3VyY2UgPSBjb252ZXJ0U2hhZGVyKHNvdXJjZSwgRVMzMDBfRlJBR01FTlRfUkVQTEFDRU1FTlRTKTtcbiAgY29uc3Qgb3V0cHV0TWF0Y2ggPSBzb3VyY2UubWF0Y2goRVMzMDBfRlJBR01FTlRfT1VUUFVUX1JFR0VYKTtcblxuICBpZiAob3V0cHV0TWF0Y2gpIHtcbiAgICBjb25zdCBvdXRwdXROYW1lID0gb3V0cHV0TWF0Y2hbMV07XG4gICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXGIke0VTMTAwX0ZSQUdNRU5UX09VVFBVVF9OQU1FfVxcXFxiYCwgJ2cnKSwgb3V0cHV0TmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgb3V0cHV0TmFtZSA9ICdmcmFnbWVudENvbG9yJztcbiAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShSRUdFWF9TVEFSVF9PRl9NQUlOLCBtYXRjaCA9PiBgb3V0IHZlYzQgJHtvdXRwdXROYW1lfTtcXG4ke21hdGNofWApLnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXGIke0VTMTAwX0ZSQUdNRU5UX09VVFBVVF9OQU1FfVxcXFxiYCwgJ2cnKSwgb3V0cHV0TmFtZSk7XG4gIH1cblxuICByZXR1cm4gc291cmNlO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RnJhZ21lbnRTaGFkZXJUbzEwMChzb3VyY2UpIHtcbiAgc291cmNlID0gY29udmVydFNoYWRlcihzb3VyY2UsIEVTMTAwX0ZSQUdNRU5UX1JFUExBQ0VNRU5UUyk7XG4gIGNvbnN0IG91dHB1dE1hdGNoID0gc291cmNlLm1hdGNoKEVTMzAwX0ZSQUdNRU5UX09VVFBVVF9SRUdFWCk7XG5cbiAgaWYgKG91dHB1dE1hdGNoKSB7XG4gICAgY29uc3Qgb3V0cHV0TmFtZSA9IG91dHB1dE1hdGNoWzFdO1xuICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKEVTMzAwX0ZSQUdNRU5UX09VVFBVVF9SRUdFWCwgJycpLnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXGIke291dHB1dE5hbWV9XFxcXGJgLCAnZycpLCBFUzEwMF9GUkFHTUVOVF9PVVRQVVRfTkFNRSk7XG4gIH1cblxuICByZXR1cm4gc291cmNlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHJhbnNwaWxlLXNoYWRlci5qcy5tYXAiLCJleHBvcnQgY29uc3QgTU9EVUxFX0lOSkVDVE9SU19WUyA9IGBcXFxuI2lmZGVmIE1PRFVMRV9MT0dERVBUSFxuICBsb2dkZXB0aF9hZGp1c3RQb3NpdGlvbihnbF9Qb3NpdGlvbik7XG4jZW5kaWZcbmA7XG5leHBvcnQgY29uc3QgTU9EVUxFX0lOSkVDVE9SU19GUyA9IGBcXFxuI2lmZGVmIE1PRFVMRV9NQVRFUklBTFxuICBnbF9GcmFnQ29sb3IgPSBtYXRlcmlhbF9maWx0ZXJDb2xvcihnbF9GcmFnQ29sb3IpO1xuI2VuZGlmXG5cbiNpZmRlZiBNT0RVTEVfTElHSFRJTkdcbiAgZ2xfRnJhZ0NvbG9yID0gbGlnaHRpbmdfZmlsdGVyQ29sb3IoZ2xfRnJhZ0NvbG9yKTtcbiNlbmRpZlxuXG4jaWZkZWYgTU9EVUxFX0ZPR1xuICBnbF9GcmFnQ29sb3IgPSBmb2dfZmlsdGVyQ29sb3IoZ2xfRnJhZ0NvbG9yKTtcbiNlbmRpZlxuXG4jaWZkZWYgTU9EVUxFX1BJQ0tJTkdcbiAgZ2xfRnJhZ0NvbG9yID0gcGlja2luZ19maWx0ZXJIaWdobGlnaHRDb2xvcihnbF9GcmFnQ29sb3IpO1xuICBnbF9GcmFnQ29sb3IgPSBwaWNraW5nX2ZpbHRlclBpY2tpbmdDb2xvcihnbF9GcmFnQ29sb3IpO1xuI2VuZGlmXG5cbiNpZmRlZiBNT0RVTEVfTE9HREVQVEhcbiAgbG9nZGVwdGhfc2V0RnJhZ0RlcHRoKCk7XG4jZW5kaWZcbmA7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2R1bGUtaW5qZWN0b3JzLmpzLm1hcCIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnc2hhZGVydG9vbHM6IGFzc2VydGlvbiBmYWlsZWQuJyk7XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydC5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc09sZElFKG9wdHMgPSB7fSkge1xuICBjb25zdCBuYXZpZ2F0b3IgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5uYXZpZ2F0b3IgfHwge30gOiB7fTtcbiAgY29uc3QgdXNlckFnZW50ID0gb3B0cy51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgY29uc3QgaXNNU0lFID0gdXNlckFnZW50LmluZGV4T2YoJ01TSUUgJykgIT09IC0xO1xuICBjb25zdCBpc1RyaWRlbnQgPSB1c2VyQWdlbnQuaW5kZXhPZignVHJpZGVudC8nKSAhPT0gLTE7XG4gIHJldHVybiBpc01TSUUgfHwgaXNUcmlkZW50O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMtb2xkLWllLmpzLm1hcCIsImltcG9ydCBpc09sZElFIGZyb20gJy4vaXMtb2xkLWllJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9hc3NlcnQnO1xuY29uc3QgR0xfVkVORE9SID0gMHgxZjAwO1xuY29uc3QgR0xfUkVOREVSRVIgPSAweDFmMDE7XG5jb25zdCBHTF9WRVJTSU9OID0gMHgxZjAyO1xuY29uc3QgR0xfU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OID0gMHg4YjhjO1xuY29uc3QgV0VCR0xfRkVBVFVSRVMgPSB7XG4gIEdMU0xfRlJBR19EQVRBOiBbJ1dFQkdMX2RyYXdfYnVmZmVycycsIHRydWVdLFxuICBHTFNMX0ZSQUdfREVQVEg6IFsnRVhUX2ZyYWdfZGVwdGgnLCB0cnVlXSxcbiAgR0xTTF9ERVJJVkFUSVZFUzogWydPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLCB0cnVlXSxcbiAgR0xTTF9URVhUVVJFX0xPRDogWydFWFRfc2hhZGVyX3RleHR1cmVfbG9kJywgdHJ1ZV1cbn07XG5jb25zdCBGRUFUVVJFUyA9IHt9O1xuT2JqZWN0LmtleXMoV0VCR0xfRkVBVFVSRVMpLmZvckVhY2goa2V5ID0+IHtcbiAgRkVBVFVSRVNba2V5XSA9IGtleTtcbn0pO1xuZXhwb3J0IHsgRkVBVFVSRVMgfTtcblxuZnVuY3Rpb24gaXNXZWJHTDIoZ2wpIHtcbiAgaWYgKHR5cGVvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ICE9PSAndW5kZWZpbmVkJyAmJiBnbCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBCb29sZWFuKGdsICYmIGdsLl92ZXJzaW9uID09PSAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHRJbmZvKGdsKSB7XG4gIGNvbnN0IGluZm8gPSBnbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8nKTtcbiAgY29uc3QgdmVuZG9yID0gZ2wuZ2V0UGFyYW1ldGVyKGluZm8gJiYgaW5mby5VTk1BU0tFRF9WRU5ET1JfV0VCR0wgfHwgR0xfVkVORE9SKTtcbiAgY29uc3QgcmVuZGVyZXIgPSBnbC5nZXRQYXJhbWV0ZXIoaW5mbyAmJiBpbmZvLlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMIHx8IEdMX1JFTkRFUkVSKTtcbiAgY29uc3QgZ3B1VmVuZG9yID0gaWRlbnRpZnlHUFVWZW5kb3IodmVuZG9yLCByZW5kZXJlcik7XG4gIGNvbnN0IGdwdUluZm8gPSB7XG4gICAgZ3B1VmVuZG9yLFxuICAgIHZlbmRvcixcbiAgICByZW5kZXJlcixcbiAgICB2ZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoR0xfVkVSU0lPTiksXG4gICAgc2hhZGluZ0xhbmd1YWdlVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKEdMX1NIQURJTkdfTEFOR1VBR0VfVkVSU0lPTilcbiAgfTtcbiAgcmV0dXJuIGdwdUluZm87XG59XG5cbmZ1bmN0aW9uIGlkZW50aWZ5R1BVVmVuZG9yKHZlbmRvciwgcmVuZGVyZXIpIHtcbiAgaWYgKHZlbmRvci5tYXRjaCgvTlZJRElBL2kpIHx8IHJlbmRlcmVyLm1hdGNoKC9OVklESUEvaSkpIHtcbiAgICByZXR1cm4gJ05WSURJQSc7XG4gIH1cblxuICBpZiAodmVuZG9yLm1hdGNoKC9JTlRFTC9pKSB8fCByZW5kZXJlci5tYXRjaCgvSU5URUwvaSkpIHtcbiAgICByZXR1cm4gJ0lOVEVMJztcbiAgfVxuXG4gIGlmICh2ZW5kb3IubWF0Y2goL0FNRC9pKSB8fCByZW5kZXJlci5tYXRjaCgvQU1EL2kpIHx8IHZlbmRvci5tYXRjaCgvQVRJL2kpIHx8IHJlbmRlcmVyLm1hdGNoKC9BVEkvaSkpIHtcbiAgICByZXR1cm4gJ0FNRCc7XG4gIH1cblxuICByZXR1cm4gJ1VOS05PV04gR1BVJztcbn1cblxuY29uc3QgY29tcGlsZWRHbHNsRXh0ZW5zaW9ucyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGNhbkNvbXBpbGVHTEdTRXh0ZW5zaW9uKGdsLCBjYXAsIG9wdHMgPSB7fSkge1xuICBjb25zdCBmZWF0dXJlID0gV0VCR0xfRkVBVFVSRVNbY2FwXTtcbiAgYXNzZXJ0KGZlYXR1cmUsIGNhcCk7XG5cbiAgaWYgKCFpc09sZElFKG9wdHMpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoY2FwIGluIGNvbXBpbGVkR2xzbEV4dGVuc2lvbnMpIHtcbiAgICByZXR1cm4gY29tcGlsZWRHbHNsRXh0ZW5zaW9uc1tjYXBdO1xuICB9XG5cbiAgY29uc3QgZXh0ZW5zaW9uTmFtZSA9IGZlYXR1cmVbMF07XG4gIGNvbnN0IGJlaGF2aW9yID0gb3B0cy5iZWhhdmlvciB8fCAnZW5hYmxlJztcbiAgY29uc3Qgc291cmNlID0gYCNleHRlbnNpb24gR0xfJHtleHRlbnNpb25OYW1lfSA6ICR7YmVoYXZpb3J9XFxudm9pZCBtYWluKHZvaWQpIHt9YDtcbiAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKDM1NjMzKTtcbiAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICBjb25zdCBjYW5Db21waWxlID0gZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgMzU3MTMpO1xuICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgY29tcGlsZWRHbHNsRXh0ZW5zaW9uc1tjYXBdID0gY2FuQ29tcGlsZTtcbiAgcmV0dXJuIGNhbkNvbXBpbGU7XG59XG5cbmZ1bmN0aW9uIGdldEZlYXR1cmUoZ2wsIGNhcCkge1xuICBjb25zdCBmZWF0dXJlID0gV0VCR0xfRkVBVFVSRVNbY2FwXTtcbiAgYXNzZXJ0KGZlYXR1cmUsIGNhcCk7XG4gIGNvbnN0IGV4dGVuc2lvbk5hbWUgPSBpc1dlYkdMMihnbCkgPyBmZWF0dXJlWzFdIHx8IGZlYXR1cmVbMF0gOiBmZWF0dXJlWzBdO1xuICBjb25zdCB2YWx1ZSA9IHR5cGVvZiBleHRlbnNpb25OYW1lID09PSAnc3RyaW5nJyA/IEJvb2xlYW4oZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbk5hbWUpKSA6IGV4dGVuc2lvbk5hbWU7XG4gIGFzc2VydCh2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IHRydWUpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNGZWF0dXJlcyhnbCwgZmVhdHVyZXMpIHtcbiAgZmVhdHVyZXMgPSBBcnJheS5pc0FycmF5KGZlYXR1cmVzKSA/IGZlYXR1cmVzIDogW2ZlYXR1cmVzXTtcbiAgcmV0dXJuIGZlYXR1cmVzLmV2ZXJ5KGZlYXR1cmUgPT4gZ2V0RmVhdHVyZShnbCwgZmVhdHVyZSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViZ2wtaW5mby5qcy5tYXAiLCJpbXBvcnQgeyBnZXRUeXBlZEFycmF5RnJvbUdMVHlwZSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL3R5cGVkLWFycmF5LXV0aWxzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBjaGVja1Byb3BzIH0gZnJvbSAnLi4vdXRpbHMvY2hlY2stcHJvcHMnO1xuY29uc3QgREVGQVVMVF9BQ0NFU1NPUl9WQUxVRVMgPSB7XG4gIG9mZnNldDogMCxcbiAgc3RyaWRlOiAwLFxuICB0eXBlOiA1MTI2LFxuICBzaXplOiAxLFxuICBkaXZpc29yOiAwLFxuICBub3JtYWxpemVkOiBmYWxzZSxcbiAgaW50ZWdlcjogZmFsc2Vcbn07XG5jb25zdCBQUk9QX0NIRUNLUyA9IHtcbiAgZGVwcmVjYXRlZFByb3BzOiB7XG4gICAgaW5zdGFuY2VkOiAnZGl2aXNvcicsXG4gICAgaXNJbnN0YW5jZWQ6ICdkaXZpc29yJ1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWNjZXNzb3Ige1xuICBzdGF0aWMgZ2V0Qnl0ZXNQZXJFbGVtZW50KGFjY2Vzc29yKSB7XG4gICAgY29uc3QgQXJyYXlUeXBlID0gZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUoYWNjZXNzb3IudHlwZSB8fCA1MTI2KTtcbiAgICByZXR1cm4gQXJyYXlUeXBlLkJZVEVTX1BFUl9FTEVNRU5UO1xuICB9XG5cbiAgc3RhdGljIGdldEJ5dGVzUGVyVmVydGV4KGFjY2Vzc29yKSB7XG4gICAgYXNzZXJ0KGFjY2Vzc29yLnNpemUpO1xuICAgIGNvbnN0IEFycmF5VHlwZSA9IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlKGFjY2Vzc29yLnR5cGUgfHwgNTEyNik7XG4gICAgcmV0dXJuIEFycmF5VHlwZS5CWVRFU19QRVJfRUxFTUVOVCAqIGFjY2Vzc29yLnNpemU7XG4gIH1cblxuICBzdGF0aWMgcmVzb2x2ZSguLi5hY2Nlc3NvcnMpIHtcbiAgICByZXR1cm4gbmV3IEFjY2Vzc29yKC4uLltERUZBVUxUX0FDQ0VTU09SX1ZBTFVFUywgLi4uYWNjZXNzb3JzXSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvciguLi5hY2Nlc3NvcnMpIHtcbiAgICBhY2Nlc3NvcnMuZm9yRWFjaChhY2Nlc3NvciA9PiB0aGlzLl9hc3NpZ24oYWNjZXNzb3IpKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICB9XG5cbiAgZ2V0IEJZVEVTX1BFUl9FTEVNRU5UKCkge1xuICAgIHJldHVybiBBY2Nlc3Nvci5nZXRCeXRlc1BlckVsZW1lbnQodGhpcyk7XG4gIH1cblxuICBnZXQgQllURVNfUEVSX1ZFUlRFWCgpIHtcbiAgICByZXR1cm4gQWNjZXNzb3IuZ2V0Qnl0ZXNQZXJWZXJ0ZXgodGhpcyk7XG4gIH1cblxuICBfYXNzaWduKHByb3BzID0ge30pIHtcbiAgICBwcm9wcyA9IGNoZWNrUHJvcHMoJ0FjY2Vzc29yJywgcHJvcHMsIFBST1BfQ0hFQ0tTKTtcblxuICAgIGlmIChwcm9wcy50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudHlwZSA9IHByb3BzLnR5cGU7XG5cbiAgICAgIGlmIChwcm9wcy50eXBlID09PSA1MTI0IHx8IHByb3BzLnR5cGUgPT09IDUxMjUpIHtcbiAgICAgICAgdGhpcy5pbnRlZ2VyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvcHMuc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNpemUgPSBwcm9wcy5zaXplO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5vZmZzZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5vZmZzZXQgPSBwcm9wcy5vZmZzZXQ7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLnN0cmlkZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnN0cmlkZSA9IHByb3BzLnN0cmlkZTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMubm9ybWFsaXplZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZWQgPSBwcm9wcy5ub3JtYWxpemVkO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5pbnRlZ2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuaW50ZWdlciA9IHByb3BzLmludGVnZXI7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmRpdmlzb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5kaXZpc29yID0gcHJvcHMuZGl2aXNvcjtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuYnVmZmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyID0gcHJvcHMuYnVmZmVyO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3BzLmluZGV4ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHByb3BzLmluZGV4ID8gMSA6IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluZGV4ID0gcHJvcHMuaW5kZXg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmluc3RhbmNlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmRpdmlzb3IgPSBwcm9wcy5pbnN0YW5jZWQgPyAxIDogMDtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaXNJbnN0YW5jZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5kaXZpc29yID0gcHJvcHMuaXNJbnN0YW5jZWQgPyAxIDogMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59XG5leHBvcnQgeyBERUZBVUxUX0FDQ0VTU09SX1ZBTFVFUyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YWNjZXNzb3IuanMubWFwIiwiaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuaW1wb3J0IEFjY2Vzc29yIGZyb20gJy4vYWNjZXNzb3InO1xuaW1wb3J0IHsgZ2V0R0xUeXBlRnJvbVR5cGVkQXJyYXksIGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlIH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvdHlwZWQtYXJyYXktdXRpbHMnO1xuaW1wb3J0IHsgYXNzZXJ0V2ViR0wyQ29udGV4dCwgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgY2hlY2tQcm9wcyB9IGZyb20gJy4uL3V0aWxzL2NoZWNrLXByb3BzJztcbmNvbnN0IERFQlVHX0RBVEFfTEVOR1RIID0gMTA7XG5jb25zdCBERVBSRUNBVEVEX1BST1BTID0ge1xuICBvZmZzZXQ6ICdhY2Nlc3Nvci5vZmZzZXQnLFxuICBzdHJpZGU6ICdhY2Nlc3Nvci5zdHJpZGUnLFxuICB0eXBlOiAnYWNjZXNzb3IudHlwZScsXG4gIHNpemU6ICdhY2Nlc3Nvci5zaXplJyxcbiAgZGl2aXNvcjogJ2FjY2Vzc29yLmRpdmlzb3InLFxuICBub3JtYWxpemVkOiAnYWNjZXNzb3Iubm9ybWFsaXplZCcsXG4gIGludGVnZXI6ICdhY2Nlc3Nvci5pbnRlZ2VyJyxcbiAgaW5zdGFuY2VkOiAnYWNjZXNzb3IuZGl2aXNvcicsXG4gIGlzSW5zdGFuY2VkOiAnYWNjZXNzb3IuZGl2aXNvcidcbn07XG5jb25zdCBQUk9QX0NIRUNLU19JTklUSUFMSVpFID0ge1xuICByZW1vdmVkUHJvcHM6IHt9LFxuICByZXBsYWNlZFByb3BzOiB7XG4gICAgYnl0ZXM6ICdieXRlTGVuZ3RoJ1xuICB9LFxuICBkZXByZWNhdGVkUHJvcHM6IERFUFJFQ0FURURfUFJPUFNcbn07XG5jb25zdCBQUk9QX0NIRUNLU19TRVRfUFJPUFMgPSB7XG4gIHJlbW92ZWRQcm9wczogREVQUkVDQVRFRF9QUk9QU1xufTtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1ZmZlciBleHRlbmRzIFJlc291cmNlIHtcbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzID0ge30pIHtcbiAgICBzdXBlcihnbCwgcHJvcHMpO1xuICAgIHRoaXMuc3R1YlJlbW92ZWRNZXRob2RzKCdCdWZmZXInLCAndjYuMCcsIFsnbGF5b3V0JywgJ3NldExheW91dCcsICdnZXRJbmRleGVkUGFyYW1ldGVyJ10pO1xuICAgIHRoaXMudGFyZ2V0ID0gcHJvcHMudGFyZ2V0IHx8ICh0aGlzLmdsLndlYmdsMiA/IDM2NjYyIDogMzQ5NjIpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBnZXRFbGVtZW50Q291bnQoYWNjZXNzb3IgPSB0aGlzLmFjY2Vzc29yKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy5ieXRlTGVuZ3RoIC8gQWNjZXNzb3IuZ2V0Qnl0ZXNQZXJFbGVtZW50KGFjY2Vzc29yKSk7XG4gIH1cblxuICBnZXRWZXJ0ZXhDb3VudChhY2Nlc3NvciA9IHRoaXMuYWNjZXNzb3IpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLmJ5dGVMZW5ndGggLyBBY2Nlc3Nvci5nZXRCeXRlc1BlclZlcnRleChhY2Nlc3NvcikpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShwcm9wcyA9IHt9KSB7XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhwcm9wcykpIHtcbiAgICAgIHByb3BzID0ge1xuICAgICAgICBkYXRhOiBwcm9wc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHByb3BzKSkge1xuICAgICAgcHJvcHMgPSB7XG4gICAgICAgIGJ5dGVMZW5ndGg6IHByb3BzXG4gICAgICB9O1xuICAgIH1cblxuICAgIHByb3BzID0gY2hlY2tQcm9wcygnQnVmZmVyJywgcHJvcHMsIFBST1BfQ0hFQ0tTX0lOSVRJQUxJWkUpO1xuICAgIHRoaXMudXNhZ2UgPSBwcm9wcy51c2FnZSB8fCAzNTA0NDtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IG51bGw7XG4gICAgdGhpcy5zZXRBY2Nlc3NvcihPYmplY3QuYXNzaWduKHt9LCBwcm9wcywgcHJvcHMuYWNjZXNzb3IpKTtcblxuICAgIGlmIChwcm9wcy5kYXRhKSB7XG4gICAgICB0aGlzLl9zZXREYXRhKHByb3BzLmRhdGEsIHByb3BzLm9mZnNldCwgcHJvcHMuYnl0ZUxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldEJ5dGVMZW5ndGgocHJvcHMuYnl0ZUxlbmd0aCB8fCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFByb3BzKHByb3BzKSB7XG4gICAgcHJvcHMgPSBjaGVja1Byb3BzKCdCdWZmZXInLCBwcm9wcywgUFJPUF9DSEVDS1NfU0VUX1BST1BTKTtcblxuICAgIGlmICgnYWNjZXNzb3InIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEFjY2Vzc29yKHByb3BzLmFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEFjY2Vzc29yKGFjY2Vzc29yKSB7XG4gICAgYWNjZXNzb3IgPSBPYmplY3QuYXNzaWduKHt9LCBhY2Nlc3Nvcik7XG4gICAgZGVsZXRlIGFjY2Vzc29yLmJ1ZmZlcjtcbiAgICB0aGlzLmFjY2Vzc29yID0gbmV3IEFjY2Vzc29yKGFjY2Vzc29yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlYWxsb2NhdGUoYnl0ZUxlbmd0aCkge1xuICAgIGlmIChieXRlTGVuZ3RoID4gdGhpcy5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aGlzLl9zZXRCeXRlTGVuZ3RoKGJ5dGVMZW5ndGgpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ5dGVzVXNlZCA9IGJ5dGVMZW5ndGg7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2V0RGF0YShwcm9wcykge1xuICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICB9XG5cbiAgc3ViRGF0YShwcm9wcykge1xuICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcocHJvcHMpKSB7XG4gICAgICBwcm9wcyA9IHtcbiAgICAgICAgZGF0YTogcHJvcHNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZGF0YSxcbiAgICAgIG9mZnNldCA9IDAsXG4gICAgICBzcmNPZmZzZXQgPSAwXG4gICAgfSA9IHByb3BzO1xuICAgIGNvbnN0IGJ5dGVMZW5ndGggPSBwcm9wcy5ieXRlTGVuZ3RoIHx8IHByb3BzLmxlbmd0aDtcbiAgICBhc3NlcnQoZGF0YSk7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nbC53ZWJnbDIgPyAzNjY2MyA6IHRoaXMudGFyZ2V0O1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIHRoaXMuaGFuZGxlKTtcblxuICAgIGlmIChzcmNPZmZzZXQgIT09IDAgfHwgYnl0ZUxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhc3NlcnRXZWJHTDJDb250ZXh0KHRoaXMuZ2wpO1xuICAgICAgdGhpcy5nbC5idWZmZXJTdWJEYXRhKHRoaXMudGFyZ2V0LCBvZmZzZXQsIGRhdGEsIHNyY09mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2wuYnVmZmVyU3ViRGF0YSh0YXJnZXQsIG9mZnNldCwgZGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRhcmdldCwgbnVsbCk7XG4gICAgdGhpcy5kZWJ1Z0RhdGEgPSBudWxsO1xuXG4gICAgdGhpcy5faW5mZXJUeXBlKGRhdGEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjb3B5RGF0YSh7XG4gICAgc291cmNlQnVmZmVyLFxuICAgIHJlYWRPZmZzZXQgPSAwLFxuICAgIHdyaXRlT2Zmc2V0ID0gMCxcbiAgICBzaXplXG4gIH0pIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuICAgIGFzc2VydFdlYkdMMkNvbnRleHQoZ2wpO1xuICAgIGdsLmJpbmRCdWZmZXIoMzY2NjIsIHNvdXJjZUJ1ZmZlci5oYW5kbGUpO1xuICAgIGdsLmJpbmRCdWZmZXIoMzY2NjMsIHRoaXMuaGFuZGxlKTtcbiAgICBnbC5jb3B5QnVmZmVyU3ViRGF0YSgzNjY2MiwgMzY2NjMsIHJlYWRPZmZzZXQsIHdyaXRlT2Zmc2V0LCBzaXplKTtcbiAgICBnbC5iaW5kQnVmZmVyKDM2NjYyLCBudWxsKTtcbiAgICBnbC5iaW5kQnVmZmVyKDM2NjYzLCBudWxsKTtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IG51bGw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXREYXRhKHtcbiAgICBkc3REYXRhID0gbnVsbCxcbiAgICBzcmNCeXRlT2Zmc2V0ID0gMCxcbiAgICBkc3RPZmZzZXQgPSAwLFxuICAgIGxlbmd0aCA9IDBcbiAgfSA9IHt9KSB7XG4gICAgYXNzZXJ0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcbiAgICBjb25zdCBBcnJheVR5cGUgPSBnZXRUeXBlZEFycmF5RnJvbUdMVHlwZSh0aGlzLmFjY2Vzc29yLnR5cGUgfHwgNTEyNiwge1xuICAgICAgY2xhbXBlZDogZmFsc2VcbiAgICB9KTtcblxuICAgIGNvbnN0IHNvdXJjZUF2YWlsYWJsZUVsZW1lbnRDb3VudCA9IHRoaXMuX2dldEF2YWlsYWJsZUVsZW1lbnRDb3VudChzcmNCeXRlT2Zmc2V0KTtcblxuICAgIGNvbnN0IGRzdEVsZW1lbnRPZmZzZXQgPSBkc3RPZmZzZXQ7XG4gICAgbGV0IGRzdEF2YWlsYWJsZUVsZW1lbnRDb3VudDtcbiAgICBsZXQgZHN0RWxlbWVudENvdW50O1xuXG4gICAgaWYgKGRzdERhdGEpIHtcbiAgICAgIGRzdEVsZW1lbnRDb3VudCA9IGRzdERhdGEubGVuZ3RoO1xuICAgICAgZHN0QXZhaWxhYmxlRWxlbWVudENvdW50ID0gZHN0RWxlbWVudENvdW50IC0gZHN0RWxlbWVudE9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgZHN0QXZhaWxhYmxlRWxlbWVudENvdW50ID0gTWF0aC5taW4oc291cmNlQXZhaWxhYmxlRWxlbWVudENvdW50LCBsZW5ndGggfHwgc291cmNlQXZhaWxhYmxlRWxlbWVudENvdW50KTtcbiAgICAgIGRzdEVsZW1lbnRDb3VudCA9IGRzdEVsZW1lbnRPZmZzZXQgKyBkc3RBdmFpbGFibGVFbGVtZW50Q291bnQ7XG4gICAgfVxuXG4gICAgY29uc3QgY29weUVsZW1lbnRDb3VudCA9IE1hdGgubWluKHNvdXJjZUF2YWlsYWJsZUVsZW1lbnRDb3VudCwgZHN0QXZhaWxhYmxlRWxlbWVudENvdW50KTtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgY29weUVsZW1lbnRDb3VudDtcbiAgICBhc3NlcnQobGVuZ3RoIDw9IGNvcHlFbGVtZW50Q291bnQpO1xuICAgIGRzdERhdGEgPSBkc3REYXRhIHx8IG5ldyBBcnJheVR5cGUoZHN0RWxlbWVudENvdW50KTtcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIoMzY2NjIsIHRoaXMuaGFuZGxlKTtcbiAgICB0aGlzLmdsLmdldEJ1ZmZlclN1YkRhdGEoMzY2NjIsIHNyY0J5dGVPZmZzZXQsIGRzdERhdGEsIGRzdE9mZnNldCwgbGVuZ3RoKTtcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIoMzY2NjIsIG51bGwpO1xuICAgIHJldHVybiBkc3REYXRhO1xuICB9XG5cbiAgYmluZCh7XG4gICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQsXG4gICAgaW5kZXggPSB0aGlzLmFjY2Vzc29yICYmIHRoaXMuYWNjZXNzb3IuaW5kZXgsXG4gICAgb2Zmc2V0ID0gMCxcbiAgICBzaXplXG4gIH0gPSB7fSkge1xuICAgIGlmICh0YXJnZXQgPT09IDM1MzQ1IHx8IHRhcmdldCA9PT0gMzU5ODIpIHtcbiAgICAgIGlmIChzaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyUmFuZ2UodGFyZ2V0LCBpbmRleCwgdGhpcy5oYW5kbGUsIG9mZnNldCwgc2l6ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnQob2Zmc2V0ID09PSAwKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyQmFzZSh0YXJnZXQsIGluZGV4LCB0aGlzLmhhbmRsZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVuYmluZCh7XG4gICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQsXG4gICAgaW5kZXggPSB0aGlzLmFjY2Vzc29yICYmIHRoaXMuYWNjZXNzb3IuaW5kZXhcbiAgfSA9IHt9KSB7XG4gICAgY29uc3QgaXNJbmRleGVkQnVmZmVyID0gdGFyZ2V0ID09PSAzNTM0NSB8fCB0YXJnZXQgPT09IDM1OTgyO1xuXG4gICAgaWYgKGlzSW5kZXhlZEJ1ZmZlcikge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyQmFzZSh0YXJnZXQsIGluZGV4LCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRhcmdldCwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXREZWJ1Z0RhdGEoKSB7XG4gICAgaWYgKCF0aGlzLmRlYnVnRGF0YSkge1xuICAgICAgdGhpcy5kZWJ1Z0RhdGEgPSB0aGlzLmdldERhdGEoe1xuICAgICAgICBsZW5ndGg6IE1hdGgubWluKERFQlVHX0RBVEFfTEVOR1RILCB0aGlzLmJ5dGVMZW5ndGgpXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IHRoaXMuZGVidWdEYXRhLFxuICAgICAgICBjaGFuZ2VkOiB0cnVlXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiB0aGlzLmRlYnVnRGF0YSxcbiAgICAgIGNoYW5nZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIGludmFsaWRhdGVEZWJ1Z0RhdGEoKSB7XG4gICAgdGhpcy5kZWJ1Z0RhdGEgPSBudWxsO1xuICB9XG5cbiAgX3NldERhdGEoZGF0YSwgb2Zmc2V0ID0gMCwgYnl0ZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aCArIG9mZnNldCkge1xuICAgIGFzc2VydChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpO1xuXG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgpO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5fZ2V0VGFyZ2V0KCk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRhcmdldCwgYnl0ZUxlbmd0aCwgdGhpcy51c2FnZSk7XG4gICAgdGhpcy5nbC5idWZmZXJTdWJEYXRhKHRhcmdldCwgb2Zmc2V0LCBkYXRhKTtcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCBudWxsKTtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IGRhdGEuc2xpY2UoMCwgREVCVUdfREFUQV9MRU5HVEgpO1xuICAgIHRoaXMuYnl0ZXNVc2VkID0gYnl0ZUxlbmd0aDtcblxuICAgIHRoaXMuX3RyYWNrQWxsb2NhdGVkTWVtb3J5KGJ5dGVMZW5ndGgpO1xuXG4gICAgY29uc3QgdHlwZSA9IGdldEdMVHlwZUZyb21UeXBlZEFycmF5KGRhdGEpO1xuICAgIGFzc2VydCh0eXBlKTtcbiAgICB0aGlzLnNldEFjY2Vzc29yKG5ldyBBY2Nlc3Nvcih0aGlzLmFjY2Vzc29yLCB7XG4gICAgICB0eXBlXG4gICAgfSkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3NldEJ5dGVMZW5ndGgoYnl0ZUxlbmd0aCwgdXNhZ2UgPSB0aGlzLnVzYWdlKSB7XG4gICAgYXNzZXJ0KGJ5dGVMZW5ndGggPj0gMCk7XG5cbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCk7XG5cbiAgICBsZXQgZGF0YSA9IGJ5dGVMZW5ndGg7XG5cbiAgICBpZiAoYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoMCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5fZ2V0VGFyZ2V0KCk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRhcmdldCwgZGF0YSwgdXNhZ2UpO1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIG51bGwpO1xuICAgIHRoaXMudXNhZ2UgPSB1c2FnZTtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IG51bGw7XG4gICAgdGhpcy5ieXRlc1VzZWQgPSBieXRlTGVuZ3RoO1xuXG4gICAgdGhpcy5fdHJhY2tBbGxvY2F0ZWRNZW1vcnkoYnl0ZUxlbmd0aCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9nZXRUYXJnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wud2ViZ2wyID8gMzY2NjMgOiB0aGlzLnRhcmdldDtcbiAgfVxuXG4gIF9nZXRBdmFpbGFibGVFbGVtZW50Q291bnQoc3JjQnl0ZU9mZnNldCkge1xuICAgIGNvbnN0IEFycmF5VHlwZSA9IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlKHRoaXMuYWNjZXNzb3IudHlwZSB8fCA1MTI2LCB7XG4gICAgICBjbGFtcGVkOiBmYWxzZVxuICAgIH0pO1xuICAgIGNvbnN0IHNvdXJjZUVsZW1lbnRPZmZzZXQgPSBzcmNCeXRlT2Zmc2V0IC8gQXJyYXlUeXBlLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRDb3VudCgpIC0gc291cmNlRWxlbWVudE9mZnNldDtcbiAgfVxuXG4gIF9pbmZlclR5cGUoZGF0YSkge1xuICAgIGlmICghdGhpcy5hY2Nlc3Nvci50eXBlKSB7XG4gICAgICB0aGlzLnNldEFjY2Vzc29yKG5ldyBBY2Nlc3Nvcih0aGlzLmFjY2Vzc29yLCB7XG4gICAgICAgIHR5cGU6IGdldEdMVHlwZUZyb21UeXBlZEFycmF5KGRhdGEpXG4gICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcbiAgfVxuXG4gIF9kZWxldGVIYW5kbGUoKSB7XG4gICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5oYW5kbGUpO1xuXG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgpO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSkge1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nbC5nZXRCdWZmZXJQYXJhbWV0ZXIodGhpcy50YXJnZXQsIHBuYW1lKTtcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy50YXJnZXQsIG51bGwpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGdldCB0eXBlKCkge1xuICAgIGxvZy5kZXByZWNhdGVkKCdCdWZmZXIudHlwZScsICdCdWZmZXIuYWNjZXNzb3IudHlwZScpKCk7XG4gICAgcmV0dXJuIHRoaXMuYWNjZXNzb3IudHlwZTtcbiAgfVxuXG4gIGdldCBieXRlcygpIHtcbiAgICBsb2cuZGVwcmVjYXRlZCgnQnVmZmVyLmJ5dGVzJywgJ0J1ZmZlci5ieXRlTGVuZ3RoJykoKTtcbiAgICByZXR1cm4gdGhpcy5ieXRlTGVuZ3RoO1xuICB9XG5cbiAgc2V0Qnl0ZUxlbmd0aChieXRlTGVuZ3RoKSB7XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ3NldEJ5dGVMZW5ndGgnLCAncmVhbGxvY2F0ZScpKCk7XG4gICAgcmV0dXJuIHRoaXMucmVhbGxvY2F0ZShieXRlTGVuZ3RoKTtcbiAgfVxuXG4gIHVwZGF0ZUFjY2Vzc29yKG9wdHMpIHtcbiAgICBsb2cuZGVwcmVjYXRlZCgndXBkYXRlQWNjZXNzb3IoLi4uKScsICdzZXRBY2Nlc3NvcihuZXcgQWNjZXNzb3IoYnVmZmVyLmFjY2Vzc29yLCAuLi4pJykoKTtcbiAgICB0aGlzLmFjY2Vzc29yID0gbmV3IEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IsIG9wdHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJ1ZmZlci5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnRXZWJHTDJDb250ZXh0LCB3aXRoUGFyYW1ldGVycyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmNvbnN0IEdMX0RFUFRIX0JVRkZFUl9CSVQgPSAweDAwMDAwMTAwO1xuY29uc3QgR0xfU1RFTkNJTF9CVUZGRVJfQklUID0gMHgwMDAwMDQwMDtcbmNvbnN0IEdMX0NPTE9SX0JVRkZFUl9CSVQgPSAweDAwMDA0MDAwO1xuY29uc3QgR0xfQ09MT1IgPSAweDE4MDA7XG5jb25zdCBHTF9ERVBUSCA9IDB4MTgwMTtcbmNvbnN0IEdMX1NURU5DSUwgPSAweDE4MDI7XG5jb25zdCBHTF9ERVBUSF9TVEVOQ0lMID0gMHg4NGY5O1xuY29uc3QgRVJSX0FSR1VNRU5UUyA9ICdjbGVhcjogYmFkIGFyZ3VtZW50cyc7XG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoZ2wsIHtcbiAgZnJhbWVidWZmZXIgPSBudWxsLFxuICBjb2xvciA9IG51bGwsXG4gIGRlcHRoID0gbnVsbCxcbiAgc3RlbmNpbCA9IG51bGxcbn0gPSB7fSkge1xuICBjb25zdCBwYXJhbWV0ZXJzID0ge307XG5cbiAgaWYgKGZyYW1lYnVmZmVyKSB7XG4gICAgcGFyYW1ldGVycy5mcmFtZWJ1ZmZlciA9IGZyYW1lYnVmZmVyO1xuICB9XG5cbiAgbGV0IGNsZWFyRmxhZ3MgPSAwO1xuXG4gIGlmIChjb2xvcikge1xuICAgIGNsZWFyRmxhZ3MgfD0gR0xfQ09MT1JfQlVGRkVSX0JJVDtcblxuICAgIGlmIChjb2xvciAhPT0gdHJ1ZSkge1xuICAgICAgcGFyYW1ldGVycy5jbGVhckNvbG9yID0gY29sb3I7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRlcHRoKSB7XG4gICAgY2xlYXJGbGFncyB8PSBHTF9ERVBUSF9CVUZGRVJfQklUO1xuXG4gICAgaWYgKGRlcHRoICE9PSB0cnVlKSB7XG4gICAgICBwYXJhbWV0ZXJzLmNsZWFyRGVwdGggPSBkZXB0aDtcbiAgICB9XG4gIH1cblxuICBpZiAoc3RlbmNpbCkge1xuICAgIGNsZWFyRmxhZ3MgfD0gR0xfU1RFTkNJTF9CVUZGRVJfQklUO1xuXG4gICAgaWYgKGRlcHRoICE9PSB0cnVlKSB7XG4gICAgICBwYXJhbWV0ZXJzLmNsZWFyU3RlbmNpbCA9IGRlcHRoO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydChjbGVhckZsYWdzICE9PSAwLCBFUlJfQVJHVU1FTlRTKTtcbiAgd2l0aFBhcmFtZXRlcnMoZ2wsIHBhcmFtZXRlcnMsICgpID0+IHtcbiAgICBnbC5jbGVhcihjbGVhckZsYWdzKTtcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY2xlYXJCdWZmZXIoZ2wsIHtcbiAgZnJhbWVidWZmZXIgPSBudWxsLFxuICBidWZmZXIgPSBHTF9DT0xPUixcbiAgZHJhd0J1ZmZlciA9IDAsXG4gIHZhbHVlID0gWzAsIDAsIDAsIDBdXG59ID0ge30pIHtcbiAgYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gIHdpdGhQYXJhbWV0ZXJzKGdsLCB7XG4gICAgZnJhbWVidWZmZXJcbiAgfSwgKCkgPT4ge1xuICAgIHN3aXRjaCAoYnVmZmVyKSB7XG4gICAgICBjYXNlIEdMX0NPTE9SOlxuICAgICAgICBzd2l0Y2ggKHZhbHVlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgY2FzZSBJbnQzMkFycmF5OlxuICAgICAgICAgICAgZ2wuY2xlYXJCdWZmZXJpdihidWZmZXIsIGRyYXdCdWZmZXIsIHZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBVaW50MzJBcnJheTpcbiAgICAgICAgICAgIGdsLmNsZWFyQnVmZmVydWl2KGJ1ZmZlciwgZHJhd0J1ZmZlciwgdmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIEZsb2F0MzJBcnJheTpcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZ2wuY2xlYXJCdWZmZXJmdihidWZmZXIsIGRyYXdCdWZmZXIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEdMX0RFUFRIOlxuICAgICAgICBnbC5jbGVhckJ1ZmZlcmZ2KEdMX0RFUFRILCAwLCBbdmFsdWVdKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgR0xfU1RFTkNJTDpcbiAgICAgICAgZ2wuY2xlYXJCdWZmZXJpdihHTF9TVEVOQ0lMLCAwLCBbdmFsdWVdKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgR0xfREVQVEhfU1RFTkNJTDpcbiAgICAgICAgY29uc3QgW2RlcHRoLCBzdGVuY2lsXSA9IHZhbHVlO1xuICAgICAgICBnbC5jbGVhckJ1ZmZlcmZpKEdMX0RFUFRIX1NURU5DSUwsIDAsIGRlcHRoLCBzdGVuY2lsKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSwgRVJSX0FSR1VNRU5UUyk7XG4gICAgfVxuICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsZWFyLmpzLm1hcCIsImltcG9ydCBCdWZmZXIgZnJvbSAnLi9idWZmZXInO1xuaW1wb3J0IEZyYW1lYnVmZmVyIGZyb20gJy4vZnJhbWVidWZmZXInO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi90ZXh0dXJlJztcbmltcG9ydCB7IGFzc2VydFdlYkdMMkNvbnRleHQsIHdpdGhQYXJhbWV0ZXJzLCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGZsaXBSb3dzLCBzY2FsZVBpeGVscyB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL3R5cGVkLWFycmF5LXV0aWxzJztcbmltcG9ydCB7IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlLCBnZXRHTFR5cGVGcm9tVHlwZWRBcnJheSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL3R5cGVkLWFycmF5LXV0aWxzJztcbmltcG9ydCB7IGdsRm9ybWF0VG9Db21wb25lbnRzLCBnbFR5cGVUb0J5dGVzIH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvZm9ybWF0LXV0aWxzJztcbmltcG9ydCB7IHRvRnJhbWVidWZmZXIgfSBmcm9tICcuLi93ZWJnbC11dGlscy90ZXh0dXJlLXV0aWxzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpeGVsc1RvQXJyYXkoc291cmNlLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3Qge1xuICAgIHNvdXJjZVggPSAwLFxuICAgIHNvdXJjZVkgPSAwLFxuICAgIHNvdXJjZUZvcm1hdCA9IDY0MDhcbiAgfSA9IG9wdGlvbnM7XG4gIGxldCB7XG4gICAgc291cmNlQXR0YWNobWVudCA9IDM2MDY0LFxuICAgIHRhcmdldCA9IG51bGwsXG4gICAgc291cmNlV2lkdGgsXG4gICAgc291cmNlSGVpZ2h0LFxuICAgIHNvdXJjZVR5cGVcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHtcbiAgICBmcmFtZWJ1ZmZlcixcbiAgICBkZWxldGVGcmFtZWJ1ZmZlclxuICB9ID0gZ2V0RnJhbWVidWZmZXIoc291cmNlKTtcbiAgYXNzZXJ0KGZyYW1lYnVmZmVyKTtcbiAgY29uc3Qge1xuICAgIGdsLFxuICAgIGhhbmRsZSxcbiAgICBhdHRhY2htZW50c1xuICB9ID0gZnJhbWVidWZmZXI7XG4gIHNvdXJjZVdpZHRoID0gc291cmNlV2lkdGggfHwgZnJhbWVidWZmZXIud2lkdGg7XG4gIHNvdXJjZUhlaWdodCA9IHNvdXJjZUhlaWdodCB8fCBmcmFtZWJ1ZmZlci5oZWlnaHQ7XG5cbiAgaWYgKHNvdXJjZUF0dGFjaG1lbnQgPT09IDM2MDY0ICYmIGhhbmRsZSA9PT0gbnVsbCkge1xuICAgIHNvdXJjZUF0dGFjaG1lbnQgPSAxMDI4O1xuICB9XG5cbiAgYXNzZXJ0KGF0dGFjaG1lbnRzW3NvdXJjZUF0dGFjaG1lbnRdKTtcbiAgc291cmNlVHlwZSA9IHNvdXJjZVR5cGUgfHwgYXR0YWNobWVudHNbc291cmNlQXR0YWNobWVudF0udHlwZTtcbiAgdGFyZ2V0ID0gZ2V0UGl4ZWxBcnJheSh0YXJnZXQsIHNvdXJjZVR5cGUsIHNvdXJjZUZvcm1hdCwgc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCk7XG4gIHNvdXJjZVR5cGUgPSBzb3VyY2VUeXBlIHx8IGdldEdMVHlwZUZyb21UeXBlZEFycmF5KHRhcmdldCk7XG4gIGNvbnN0IHByZXZIYW5kbGUgPSBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIGhhbmRsZSk7XG4gIGdsLnJlYWRQaXhlbHMoc291cmNlWCwgc291cmNlWSwgc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCwgc291cmNlRm9ybWF0LCBzb3VyY2VUeXBlLCB0YXJnZXQpO1xuICBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHByZXZIYW5kbGUgfHwgbnVsbCk7XG5cbiAgaWYgKGRlbGV0ZUZyYW1lYnVmZmVyKSB7XG4gICAgZnJhbWVidWZmZXIuZGVsZXRlKCk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRQaXhlbHNUb0J1ZmZlcihzb3VyY2UsIHtcbiAgc291cmNlWCA9IDAsXG4gIHNvdXJjZVkgPSAwLFxuICBzb3VyY2VGb3JtYXQgPSA2NDA4LFxuICB0YXJnZXQgPSBudWxsLFxuICB0YXJnZXRCeXRlT2Zmc2V0ID0gMCxcbiAgc291cmNlV2lkdGgsXG4gIHNvdXJjZUhlaWdodCxcbiAgc291cmNlVHlwZVxufSkge1xuICBjb25zdCB7XG4gICAgZnJhbWVidWZmZXIsXG4gICAgZGVsZXRlRnJhbWVidWZmZXJcbiAgfSA9IGdldEZyYW1lYnVmZmVyKHNvdXJjZSk7XG4gIGFzc2VydChmcmFtZWJ1ZmZlcik7XG4gIHNvdXJjZVdpZHRoID0gc291cmNlV2lkdGggfHwgZnJhbWVidWZmZXIud2lkdGg7XG4gIHNvdXJjZUhlaWdodCA9IHNvdXJjZUhlaWdodCB8fCBmcmFtZWJ1ZmZlci5oZWlnaHQ7XG4gIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQoZnJhbWVidWZmZXIuZ2wpO1xuICBzb3VyY2VUeXBlID0gc291cmNlVHlwZSB8fCAodGFyZ2V0ID8gdGFyZ2V0LnR5cGUgOiA1MTIxKTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBnbEZvcm1hdFRvQ29tcG9uZW50cyhzb3VyY2VGb3JtYXQpO1xuICAgIGNvbnN0IGJ5dGVDb3VudCA9IGdsVHlwZVRvQnl0ZXMoc291cmNlVHlwZSk7XG4gICAgY29uc3QgYnl0ZUxlbmd0aCA9IHRhcmdldEJ5dGVPZmZzZXQgKyBzb3VyY2VXaWR0aCAqIHNvdXJjZUhlaWdodCAqIGNvbXBvbmVudHMgKiBieXRlQ291bnQ7XG4gICAgdGFyZ2V0ID0gbmV3IEJ1ZmZlcihnbDIsIHtcbiAgICAgIGJ5dGVMZW5ndGgsXG4gICAgICBhY2Nlc3Nvcjoge1xuICAgICAgICB0eXBlOiBzb3VyY2VUeXBlLFxuICAgICAgICBzaXplOiBjb21wb25lbnRzXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB0YXJnZXQuYmluZCh7XG4gICAgdGFyZ2V0OiAzNTA1MVxuICB9KTtcbiAgd2l0aFBhcmFtZXRlcnMoZ2wyLCB7XG4gICAgZnJhbWVidWZmZXJcbiAgfSwgKCkgPT4ge1xuICAgIGdsMi5yZWFkUGl4ZWxzKHNvdXJjZVgsIHNvdXJjZVksIHNvdXJjZVdpZHRoLCBzb3VyY2VIZWlnaHQsIHNvdXJjZUZvcm1hdCwgc291cmNlVHlwZSwgdGFyZ2V0Qnl0ZU9mZnNldCk7XG4gIH0pO1xuICB0YXJnZXQudW5iaW5kKHtcbiAgICB0YXJnZXQ6IDM1MDUxXG4gIH0pO1xuXG4gIGlmIChkZWxldGVGcmFtZWJ1ZmZlcikge1xuICAgIGZyYW1lYnVmZmVyLmRlbGV0ZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb3B5VG9EYXRhVXJsKHNvdXJjZSwge1xuICBzb3VyY2VBdHRhY2htZW50ID0gMzYwNjQsXG4gIHRhcmdldE1heEhlaWdodCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG59ID0ge30pIHtcbiAgbGV0IGRhdGEgPSByZWFkUGl4ZWxzVG9BcnJheShzb3VyY2UsIHtcbiAgICBzb3VyY2VBdHRhY2htZW50XG4gIH0pO1xuICBsZXQge1xuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gc291cmNlO1xuXG4gIHdoaWxlIChoZWlnaHQgPiB0YXJnZXRNYXhIZWlnaHQpIHtcbiAgICAoe1xuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSA9IHNjYWxlUGl4ZWxzKHtcbiAgICAgIGRhdGEsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0pKTtcbiAgfVxuXG4gIGZsaXBSb3dzKHtcbiAgICBkYXRhLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNvbnN0IGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICBpbWFnZURhdGEuZGF0YS5zZXQoZGF0YSk7XG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gY29weVRvSW1hZ2Uoc291cmNlLCB7XG4gIHNvdXJjZUF0dGFjaG1lbnQgPSAzNjA2NCxcbiAgdGFyZ2V0SW1hZ2UgPSBudWxsXG59ID0ge30pIHtcbiAgY29uc3QgZGF0YVVybCA9IGNvcHlUb0RhdGFVcmwoc291cmNlLCB7XG4gICAgc291cmNlQXR0YWNobWVudFxuICB9KTtcbiAgdGFyZ2V0SW1hZ2UgPSB0YXJnZXRJbWFnZSB8fCBuZXcgSW1hZ2UoKTtcbiAgdGFyZ2V0SW1hZ2Uuc3JjID0gZGF0YVVybDtcbiAgcmV0dXJuIHRhcmdldEltYWdlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlUb1RleHR1cmUoc291cmNlLCB0YXJnZXQsIG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7XG4gICAgc291cmNlWCA9IDAsXG4gICAgc291cmNlWSA9IDAsXG4gICAgdGFyZ2V0TWlwbWFwbGV2ZWwgPSAwLFxuICAgIHRhcmdldEludGVybmFsRm9ybWF0ID0gNjQwOFxuICB9ID0gb3B0aW9ucztcbiAgbGV0IHtcbiAgICB0YXJnZXRYLFxuICAgIHRhcmdldFksXG4gICAgdGFyZ2V0WixcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHtcbiAgICBmcmFtZWJ1ZmZlcixcbiAgICBkZWxldGVGcmFtZWJ1ZmZlclxuICB9ID0gZ2V0RnJhbWVidWZmZXIoc291cmNlKTtcbiAgYXNzZXJ0KGZyYW1lYnVmZmVyKTtcbiAgY29uc3Qge1xuICAgIGdsLFxuICAgIGhhbmRsZVxuICB9ID0gZnJhbWVidWZmZXI7XG4gIGNvbnN0IGlzU3ViQ29weSA9IHR5cGVvZiB0YXJnZXRYICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgdGFyZ2V0WSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHRhcmdldFogIT09ICd1bmRlZmluZWQnO1xuICB0YXJnZXRYID0gdGFyZ2V0WCB8fCAwO1xuICB0YXJnZXRZID0gdGFyZ2V0WSB8fCAwO1xuICB0YXJnZXRaID0gdGFyZ2V0WiB8fCAwO1xuICBjb25zdCBwcmV2SGFuZGxlID0gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBoYW5kbGUpO1xuICBhc3NlcnQodGFyZ2V0KTtcbiAgbGV0IHRleHR1cmUgPSBudWxsO1xuXG4gIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBUZXh0dXJlKSB7XG4gICAgdGV4dHVyZSA9IHRhcmdldDtcbiAgICB3aWR0aCA9IE51bWJlci5pc0Zpbml0ZSh3aWR0aCkgPyB3aWR0aCA6IHRleHR1cmUud2lkdGg7XG4gICAgaGVpZ2h0ID0gTnVtYmVyLmlzRmluaXRlKGhlaWdodCkgPyBoZWlnaHQgOiB0ZXh0dXJlLmhlaWdodDtcbiAgICB0ZXh0dXJlLmJpbmQoMCk7XG4gICAgdGFyZ2V0ID0gdGV4dHVyZS50YXJnZXQ7XG4gIH1cblxuICBpZiAoIWlzU3ViQ29weSkge1xuICAgIGdsLmNvcHlUZXhJbWFnZTJEKHRhcmdldCwgdGFyZ2V0TWlwbWFwbGV2ZWwsIHRhcmdldEludGVybmFsRm9ybWF0LCBzb3VyY2VYLCBzb3VyY2VZLCB3aWR0aCwgaGVpZ2h0LCAwKTtcbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgY2FzZSAzNTUzOlxuICAgICAgY2FzZSAzNDA2NzpcbiAgICAgICAgZ2wuY29weVRleFN1YkltYWdlMkQodGFyZ2V0LCB0YXJnZXRNaXBtYXBsZXZlbCwgdGFyZ2V0WCwgdGFyZ2V0WSwgc291cmNlWCwgc291cmNlWSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM1ODY2OlxuICAgICAgY2FzZSAzMjg3OTpcbiAgICAgICAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgICAgIGdsMi5jb3B5VGV4U3ViSW1hZ2UzRCh0YXJnZXQsIHRhcmdldE1pcG1hcGxldmVsLCB0YXJnZXRYLCB0YXJnZXRZLCB0YXJnZXRaLCBzb3VyY2VYLCBzb3VyY2VZLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgaWYgKHRleHR1cmUpIHtcbiAgICB0ZXh0dXJlLnVuYmluZCgpO1xuICB9XG5cbiAgZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBwcmV2SGFuZGxlIHx8IG51bGwpO1xuXG4gIGlmIChkZWxldGVGcmFtZWJ1ZmZlcikge1xuICAgIGZyYW1lYnVmZmVyLmRlbGV0ZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRleHR1cmU7XG59XG5leHBvcnQgZnVuY3Rpb24gYmxpdChzb3VyY2UsIHRhcmdldCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICBzb3VyY2VYMCA9IDAsXG4gICAgc291cmNlWTAgPSAwLFxuICAgIHRhcmdldFgwID0gMCxcbiAgICB0YXJnZXRZMCA9IDAsXG4gICAgY29sb3IgPSB0cnVlLFxuICAgIGRlcHRoID0gZmFsc2UsXG4gICAgc3RlbmNpbCA9IGZhbHNlLFxuICAgIGZpbHRlciA9IDk3MjhcbiAgfSA9IG9wdGlvbnM7XG4gIGxldCB7XG4gICAgc291cmNlWDEsXG4gICAgc291cmNlWTEsXG4gICAgdGFyZ2V0WDEsXG4gICAgdGFyZ2V0WTEsXG4gICAgc291cmNlQXR0YWNobWVudCA9IDM2MDY0LFxuICAgIG1hc2sgPSAwXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB7XG4gICAgZnJhbWVidWZmZXI6IHNyY0ZyYW1lYnVmZmVyLFxuICAgIGRlbGV0ZUZyYW1lYnVmZmVyOiBkZWxldGVTcmNGcmFtZWJ1ZmZlclxuICB9ID0gZ2V0RnJhbWVidWZmZXIoc291cmNlKTtcbiAgY29uc3Qge1xuICAgIGZyYW1lYnVmZmVyOiBkc3RGcmFtZWJ1ZmZlcixcbiAgICBkZWxldGVGcmFtZWJ1ZmZlcjogZGVsZXRlRHN0RnJhbWVidWZmZXJcbiAgfSA9IGdldEZyYW1lYnVmZmVyKHRhcmdldCk7XG4gIGFzc2VydChzcmNGcmFtZWJ1ZmZlcik7XG4gIGFzc2VydChkc3RGcmFtZWJ1ZmZlcik7XG4gIGNvbnN0IHtcbiAgICBnbCxcbiAgICBoYW5kbGUsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHJlYWRCdWZmZXJcbiAgfSA9IGRzdEZyYW1lYnVmZmVyO1xuICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcblxuICBpZiAoIXNyY0ZyYW1lYnVmZmVyLmhhbmRsZSAmJiBzb3VyY2VBdHRhY2htZW50ID09PSAzNjA2NCkge1xuICAgIHNvdXJjZUF0dGFjaG1lbnQgPSAxMDI4O1xuICB9XG5cbiAgaWYgKGNvbG9yKSB7XG4gICAgbWFzayB8PSAxNjM4NDtcbiAgfVxuXG4gIGlmIChkZXB0aCkge1xuICAgIG1hc2sgfD0gMjU2O1xuICB9XG5cbiAgaWYgKHN0ZW5jaWwpIHtcbiAgICBtYXNrIHw9IDEwMjQ7XG4gIH1cblxuICBpZiAoZGVsZXRlU3JjRnJhbWVidWZmZXIgfHwgZGVsZXRlRHN0RnJhbWVidWZmZXIpIHtcbiAgICBpZiAobWFzayAmICgyNTYgfCAxMDI0KSkge1xuICAgICAgbWFzayA9IDE2Mzg0O1xuICAgICAgbG9nLndhcm4oJ0JsaXR0aW5nIGZyb20gb3IgaW50byBhIFRleHR1cmUgb2JqZWN0LCBmb3JjaW5nIG1hc2sgdG8gR0wuQ09MT1JfQlVGRkVSX0JJVCcpKCk7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0KG1hc2spO1xuICBzb3VyY2VYMSA9IHNvdXJjZVgxID09PSB1bmRlZmluZWQgPyBzcmNGcmFtZWJ1ZmZlci53aWR0aCA6IHNvdXJjZVgxO1xuICBzb3VyY2VZMSA9IHNvdXJjZVkxID09PSB1bmRlZmluZWQgPyBzcmNGcmFtZWJ1ZmZlci5oZWlnaHQgOiBzb3VyY2VZMTtcbiAgdGFyZ2V0WDEgPSB0YXJnZXRYMSA9PT0gdW5kZWZpbmVkID8gd2lkdGggOiB0YXJnZXRYMTtcbiAgdGFyZ2V0WTEgPSB0YXJnZXRZMSA9PT0gdW5kZWZpbmVkID8gaGVpZ2h0IDogdGFyZ2V0WTE7XG4gIGNvbnN0IHByZXZEcmF3SGFuZGxlID0gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MDA5LCBoYW5kbGUpO1xuICBjb25zdCBwcmV2UmVhZEhhbmRsZSA9IGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjAwOCwgc3JjRnJhbWVidWZmZXIuaGFuZGxlKTtcbiAgZ2wyLnJlYWRCdWZmZXIoc291cmNlQXR0YWNobWVudCk7XG4gIGdsMi5ibGl0RnJhbWVidWZmZXIoc291cmNlWDAsIHNvdXJjZVkwLCBzb3VyY2VYMSwgc291cmNlWTEsIHRhcmdldFgwLCB0YXJnZXRZMCwgdGFyZ2V0WDEsIHRhcmdldFkxLCBtYXNrLCBmaWx0ZXIpO1xuICBnbDIucmVhZEJ1ZmZlcihyZWFkQnVmZmVyKTtcbiAgZ2wyLmJpbmRGcmFtZWJ1ZmZlcigzNjAwOCwgcHJldlJlYWRIYW5kbGUgfHwgbnVsbCk7XG4gIGdsMi5iaW5kRnJhbWVidWZmZXIoMzYwMDksIHByZXZEcmF3SGFuZGxlIHx8IG51bGwpO1xuXG4gIGlmIChkZWxldGVTcmNGcmFtZWJ1ZmZlcikge1xuICAgIHNyY0ZyYW1lYnVmZmVyLmRlbGV0ZSgpO1xuICB9XG5cbiAgaWYgKGRlbGV0ZURzdEZyYW1lYnVmZmVyKSB7XG4gICAgZHN0RnJhbWVidWZmZXIuZGVsZXRlKCk7XG4gIH1cblxuICByZXR1cm4gZHN0RnJhbWVidWZmZXI7XG59XG5cbmZ1bmN0aW9uIGdldEZyYW1lYnVmZmVyKHNvdXJjZSkge1xuICBpZiAoIShzb3VyY2UgaW5zdGFuY2VvZiBGcmFtZWJ1ZmZlcikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZnJhbWVidWZmZXI6IHRvRnJhbWVidWZmZXIoc291cmNlKSxcbiAgICAgIGRlbGV0ZUZyYW1lYnVmZmVyOiB0cnVlXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZnJhbWVidWZmZXI6IHNvdXJjZSxcbiAgICBkZWxldGVGcmFtZWJ1ZmZlcjogZmFsc2VcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UGl4ZWxBcnJheShwaXhlbEFycmF5LCB0eXBlLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgaWYgKHBpeGVsQXJyYXkpIHtcbiAgICByZXR1cm4gcGl4ZWxBcnJheTtcbiAgfVxuXG4gIHR5cGUgPSB0eXBlIHx8IDUxMjE7XG4gIGNvbnN0IEFycmF5VHlwZSA9IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlKHR5cGUsIHtcbiAgICBjbGFtcGVkOiBmYWxzZVxuICB9KTtcbiAgY29uc3QgY29tcG9uZW50cyA9IGdsRm9ybWF0VG9Db21wb25lbnRzKGZvcm1hdCk7XG4gIHJldHVybiBuZXcgQXJyYXlUeXBlKHdpZHRoICogaGVpZ2h0ICogY29tcG9uZW50cyk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3B5LWFuZC1ibGl0LmpzLm1hcCIsImltcG9ydCB7IGdldFdlYkdMMkNvbnRleHQsIGFzc2VydFdlYkdMMkNvbnRleHQsIGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuaW1wb3J0IFRleHR1cmUyRCBmcm9tICcuL3RleHR1cmUtMmQnO1xuaW1wb3J0IFJlbmRlcmJ1ZmZlciBmcm9tICcuL3JlbmRlcmJ1ZmZlcic7XG5pbXBvcnQgeyBjbGVhciwgY2xlYXJCdWZmZXIgfSBmcm9tICcuL2NsZWFyJztcbmltcG9ydCB7IGNvcHlUb0RhdGFVcmwgfSBmcm9tICcuL2NvcHktYW5kLWJsaXQuanMnO1xuaW1wb3J0IHsgZ2V0RmVhdHVyZXMgfSBmcm9tICcuLi9mZWF0dXJlcyc7XG5pbXBvcnQgeyBnZXRLZXkgfSBmcm9tICcuLi93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuY29uc3QgRVJSX01VTFRJUExFX1JFTkRFUlRBUkdFVFMgPSAnTXVsdGlwbGUgcmVuZGVyIHRhcmdldHMgbm90IHN1cHBvcnRlZCc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGcmFtZWJ1ZmZlciBleHRlbmRzIFJlc291cmNlIHtcbiAgc3RhdGljIGlzU3VwcG9ydGVkKGdsLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBjb2xvckJ1ZmZlckZsb2F0LFxuICAgICAgY29sb3JCdWZmZXJIYWxmRmxvYXRcbiAgICB9ID0gb3B0aW9ucztcbiAgICBsZXQgc3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgIGlmIChjb2xvckJ1ZmZlckZsb2F0KSB7XG4gICAgICBzdXBwb3J0ZWQgPSBCb29sZWFuKGdsLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcpIHx8IGdsLmdldEV4dGVuc2lvbignV0VCR0xfY29sb3JfYnVmZmVyX2Zsb2F0JykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdCcpKTtcbiAgICB9XG5cbiAgICBpZiAoY29sb3JCdWZmZXJIYWxmRmxvYXQpIHtcbiAgICAgIHN1cHBvcnRlZCA9IHN1cHBvcnRlZCAmJiBCb29sZWFuKGdsLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcpIHx8IGdsLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9oYWxmX2Zsb2F0JykpO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBwb3J0ZWQ7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVmYXVsdEZyYW1lYnVmZmVyKGdsKSB7XG4gICAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gICAgZ2wubHVtYS5kZWZhdWx0RnJhbWVidWZmZXIgPSBnbC5sdW1hLmRlZmF1bHRGcmFtZWJ1ZmZlciB8fCBuZXcgRnJhbWVidWZmZXIoZ2wsIHtcbiAgICAgIGlkOiAnZGVmYXVsdC1mcmFtZWJ1ZmZlcicsXG4gICAgICBoYW5kbGU6IG51bGwsXG4gICAgICBhdHRhY2htZW50czoge31cbiAgICB9KTtcbiAgICByZXR1cm4gZ2wubHVtYS5kZWZhdWx0RnJhbWVidWZmZXI7XG4gIH1cblxuICBnZXQgTUFYX0NPTE9SX0FUVEFDSE1FTlRTKCkge1xuICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgcmV0dXJuIGdsMi5nZXRQYXJhbWV0ZXIoZ2wyLk1BWF9DT0xPUl9BVFRBQ0hNRU5UUyk7XG4gIH1cblxuICBnZXQgTUFYX0RSQVdfQlVGRkVSUygpIHtcbiAgICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KHRoaXMuZ2wpO1xuICAgIHJldHVybiBnbDIuZ2V0UGFyYW1ldGVyKGdsMi5NQVhfRFJBV19CVUZGRVJTKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBvcHRzID0ge30pIHtcbiAgICBzdXBlcihnbCwgb3B0cyk7XG4gICAgdGhpcy53aWR0aCA9IG51bGw7XG4gICAgdGhpcy5oZWlnaHQgPSBudWxsO1xuICAgIHRoaXMuYXR0YWNobWVudHMgPSB7fTtcbiAgICB0aGlzLnJlYWRCdWZmZXIgPSAzNjA2NDtcbiAgICB0aGlzLmRyYXdCdWZmZXJzID0gWzM2MDY0XTtcbiAgICB0aGlzLm93blJlc291cmNlcyA9IFtdO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGdldCBjb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2htZW50c1szNjA2NF0gfHwgbnVsbDtcbiAgfVxuXG4gIGdldCB0ZXh0dXJlKCkge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnRzWzM2MDY0XSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0IGRlcHRoKCkge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnRzWzM2MDk2XSB8fCB0aGlzLmF0dGFjaG1lbnRzWzMzMzA2XSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0IHN0ZW5jaWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudHNbMzYxMjhdIHx8IHRoaXMuYXR0YWNobWVudHNbMzMzMDZdIHx8IG51bGw7XG4gIH1cblxuICBpbml0aWFsaXplKHtcbiAgICB3aWR0aCA9IDEsXG4gICAgaGVpZ2h0ID0gMSxcbiAgICBhdHRhY2htZW50cyA9IG51bGwsXG4gICAgY29sb3IgPSB0cnVlLFxuICAgIGRlcHRoID0gdHJ1ZSxcbiAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgY2hlY2sgPSB0cnVlLFxuICAgIHJlYWRCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZHJhd0J1ZmZlcnMgPSB1bmRlZmluZWRcbiAgfSkge1xuICAgIGFzc2VydCh3aWR0aCA+PSAwICYmIGhlaWdodCA+PSAwLCAnV2lkdGggYW5kIGhlaWdodCBuZWVkIHRvIGJlIGludGVnZXJzJyk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgaWYgKGF0dGFjaG1lbnRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGF0dGFjaG1lbnQgaW4gYXR0YWNobWVudHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXR0YWNobWVudHNbYXR0YWNobWVudF07XG4gICAgICAgIGNvbnN0IG9iamVjdCA9IEFycmF5LmlzQXJyYXkodGFyZ2V0KSA/IHRhcmdldFswXSA6IHRhcmdldDtcbiAgICAgICAgb2JqZWN0LnJlc2l6ZSh7XG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhdHRhY2htZW50cyA9IHRoaXMuX2NyZWF0ZURlZmF1bHRBdHRhY2htZW50cyhjb2xvciwgZGVwdGgsIHN0ZW5jaWwsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlKHtcbiAgICAgIGNsZWFyQXR0YWNobWVudHM6IHRydWUsXG4gICAgICBhdHRhY2htZW50cyxcbiAgICAgIHJlYWRCdWZmZXIsXG4gICAgICBkcmF3QnVmZmVyc1xuICAgIH0pO1xuXG4gICAgaWYgKGF0dGFjaG1lbnRzICYmIGNoZWNrKSB7XG4gICAgICB0aGlzLmNoZWNrU3RhdHVzKCk7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGZvciAoY29uc3QgcmVzb3VyY2Ugb2YgdGhpcy5vd25SZXNvdXJjZXMpIHtcbiAgICAgIHJlc291cmNlLmRlbGV0ZSgpO1xuICAgIH1cblxuICAgIHN1cGVyLmRlbGV0ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXBkYXRlKHtcbiAgICBhdHRhY2htZW50cyA9IHt9LFxuICAgIHJlYWRCdWZmZXIsXG4gICAgZHJhd0J1ZmZlcnMsXG4gICAgY2xlYXJBdHRhY2htZW50cyA9IGZhbHNlLFxuICAgIHJlc2l6ZUF0dGFjaG1lbnRzID0gdHJ1ZVxuICB9KSB7XG4gICAgdGhpcy5hdHRhY2goYXR0YWNobWVudHMsIHtcbiAgICAgIGNsZWFyQXR0YWNobWVudHMsXG4gICAgICByZXNpemVBdHRhY2htZW50c1xuICAgIH0pO1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgcHJldkhhbmRsZSA9IGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgdGhpcy5oYW5kbGUpO1xuXG4gICAgaWYgKHJlYWRCdWZmZXIpIHtcbiAgICAgIHRoaXMuX3NldFJlYWRCdWZmZXIocmVhZEJ1ZmZlcik7XG4gICAgfVxuXG4gICAgaWYgKGRyYXdCdWZmZXJzKSB7XG4gICAgICB0aGlzLl9zZXREcmF3QnVmZmVycyhkcmF3QnVmZmVycyk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBwcmV2SGFuZGxlIHx8IG51bGwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzaXplKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgaWYgKHRoaXMuaGFuZGxlID09PSBudWxsKSB7XG4gICAgICBhc3NlcnQod2lkdGggPT09IHVuZGVmaW5lZCAmJiBoZWlnaHQgPT09IHVuZGVmaW5lZCk7XG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB3aWR0aCA9IHRoaXMuZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICAgIH1cblxuICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVpZ2h0ID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICAgIH1cblxuICAgIGlmICh3aWR0aCAhPT0gdGhpcy53aWR0aCAmJiBoZWlnaHQgIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICBsb2cubG9nKDIsIGBSZXNpemluZyBmcmFtZWJ1ZmZlciAke3RoaXMuaWR9IHRvICR7d2lkdGh9eCR7aGVpZ2h0fWApKCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRhY2htZW50UG9pbnQgaW4gdGhpcy5hdHRhY2htZW50cykge1xuICAgICAgdGhpcy5hdHRhY2htZW50c1thdHRhY2htZW50UG9pbnRdLnJlc2l6ZSh7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGF0dGFjaChhdHRhY2htZW50cywge1xuICAgIGNsZWFyQXR0YWNobWVudHMgPSBmYWxzZSxcbiAgICByZXNpemVBdHRhY2htZW50cyA9IHRydWVcbiAgfSA9IHt9KSB7XG4gICAgY29uc3QgbmV3QXR0YWNobWVudHMgPSB7fTtcblxuICAgIGlmIChjbGVhckF0dGFjaG1lbnRzKSB7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmF0dGFjaG1lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIG5ld0F0dGFjaG1lbnRzW2tleV0gPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihuZXdBdHRhY2htZW50cywgYXR0YWNobWVudHMpO1xuICAgIGNvbnN0IHByZXZIYW5kbGUgPSB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgdGhpcy5oYW5kbGUpO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gbmV3QXR0YWNobWVudHMpIHtcbiAgICAgIGFzc2VydChrZXkgIT09IHVuZGVmaW5lZCwgJ01pc3NwZWxsZWQgZnJhbWVidWZmZXIgYmluZGluZyBwb2ludD8nKTtcbiAgICAgIGNvbnN0IGF0dGFjaG1lbnQgPSBOdW1iZXIoa2V5KTtcbiAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBuZXdBdHRhY2htZW50c1thdHRhY2htZW50XTtcbiAgICAgIGxldCBvYmplY3QgPSBkZXNjcmlwdG9yO1xuXG4gICAgICBpZiAoIW9iamVjdCkge1xuICAgICAgICB0aGlzLl91bmF0dGFjaChhdHRhY2htZW50KTtcbiAgICAgIH0gZWxzZSBpZiAob2JqZWN0IGluc3RhbmNlb2YgUmVuZGVyYnVmZmVyKSB7XG4gICAgICAgIHRoaXMuX2F0dGFjaFJlbmRlcmJ1ZmZlcih7XG4gICAgICAgICAgYXR0YWNobWVudCxcbiAgICAgICAgICByZW5kZXJidWZmZXI6IG9iamVjdFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZXNjcmlwdG9yKSkge1xuICAgICAgICBjb25zdCBbdGV4dHVyZSwgbGF5ZXIgPSAwLCBsZXZlbCA9IDBdID0gZGVzY3JpcHRvcjtcbiAgICAgICAgb2JqZWN0ID0gdGV4dHVyZTtcblxuICAgICAgICB0aGlzLl9hdHRhY2hUZXh0dXJlKHtcbiAgICAgICAgICBhdHRhY2htZW50LFxuICAgICAgICAgIHRleHR1cmUsXG4gICAgICAgICAgbGF5ZXIsXG4gICAgICAgICAgbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hdHRhY2hUZXh0dXJlKHtcbiAgICAgICAgICBhdHRhY2htZW50LFxuICAgICAgICAgIHRleHR1cmU6IG9iamVjdCxcbiAgICAgICAgICBsYXllcjogMCxcbiAgICAgICAgICBsZXZlbDogMFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc2l6ZUF0dGFjaG1lbnRzICYmIG9iamVjdCkge1xuICAgICAgICBvYmplY3QucmVzaXplKHtcbiAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBwcmV2SGFuZGxlIHx8IG51bGwpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5hdHRhY2htZW50cywgYXR0YWNobWVudHMpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuYXR0YWNobWVudHMpLmZpbHRlcihrZXkgPT4gIXRoaXMuYXR0YWNobWVudHNba2V5XSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuYXR0YWNobWVudHNba2V5XTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoZWNrU3RhdHVzKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3Qgc3RhdHVzID0gdGhpcy5nZXRTdGF0dXMoKTtcblxuICAgIGlmIChzdGF0dXMgIT09IDM2MDUzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoX2dldEZyYW1lQnVmZmVyU3RhdHVzKHN0YXR1cykpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0U3RhdHVzKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgcHJldkhhbmRsZSA9IGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgdGhpcy5oYW5kbGUpO1xuICAgIGNvbnN0IHN0YXR1cyA9IGdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMoMzYxNjApO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgcHJldkhhbmRsZSB8fCBudWxsKTtcbiAgICByZXR1cm4gc3RhdHVzO1xuICB9XG5cbiAgY2xlYXIob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgY29sb3IsXG4gICAgICBkZXB0aCxcbiAgICAgIHN0ZW5jaWwsXG4gICAgICBkcmF3QnVmZmVycyA9IFtdXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgcHJldkhhbmRsZSA9IHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCB0aGlzLmhhbmRsZSk7XG5cbiAgICBpZiAoY29sb3IgfHwgZGVwdGggfHwgc3RlbmNpbCkge1xuICAgICAgY2xlYXIodGhpcy5nbCwge1xuICAgICAgICBjb2xvcixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHN0ZW5jaWxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdCdWZmZXJzLmZvckVhY2goKHZhbHVlLCBkcmF3QnVmZmVyKSA9PiB7XG4gICAgICBjbGVhckJ1ZmZlcih0aGlzLmdsLCB7XG4gICAgICAgIGRyYXdCdWZmZXIsXG4gICAgICAgIHZhbHVlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgcHJldkhhbmRsZSB8fCBudWxsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlYWRQaXhlbHMob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5yZWFkUGl4ZWxzKCkgaXMgbm8gbG9nbmVyIHN1cHBvcnRlZCwgdXNlIHJlYWRQaXhlbHNUb0FycmF5KGZyYW1lYnVmZmVyKScpKCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZWFkUGl4ZWxzVG9CdWZmZXIob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5yZWFkUGl4ZWxzVG9CdWZmZXIoKWlzIG5vIGxvZ25lciBzdXBwb3J0ZWQsIHVzZSByZWFkUGl4ZWxzVG9CdWZmZXIoZnJhbWVidWZmZXIpJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvcHlUb0RhdGFVcmwob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5jb3B5VG9EYXRhVXJsKCkgaXMgbm8gbG9nbmVyIHN1cHBvcnRlZCwgdXNlIGNvcHlUb0RhdGFVcmwoZnJhbWVidWZmZXIpJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvcHlUb0ltYWdlKG9wdHMgPSB7fSkge1xuICAgIGxvZy5lcnJvcignRnJhbWVidWZmZXIuY29weVRvSW1hZ2UoKSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgY29weVRvSW1hZ2UoZnJhbWVidWZmZXIpJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvcHlUb1RleHR1cmUob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5jb3B5VG9UZXh0dXJlKHsuLi59KSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgY29weVRvVGV4dHVyZShzb3VyY2UsIHRhcmdldCwgb3B0c30pJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGJsaXQob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5ibGl0KHsuLi59KSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgYmxpdChzb3VyY2UsIHRhcmdldCwgb3B0cyknKSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaW52YWxpZGF0ZSh7XG4gICAgYXR0YWNobWVudHMgPSBbXSxcbiAgICB4ID0gMCxcbiAgICB5ID0gMCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSkge1xuICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgY29uc3QgcHJldkhhbmRsZSA9IGdsMi5iaW5kRnJhbWVidWZmZXIoMzYwMDgsIHRoaXMuaGFuZGxlKTtcbiAgICBjb25zdCBpbnZhbGlkYXRlQWxsID0geCA9PT0gMCAmJiB5ID09PSAwICYmIHdpZHRoID09PSB1bmRlZmluZWQgJiYgaGVpZ2h0ID09PSB1bmRlZmluZWQ7XG5cbiAgICBpZiAoaW52YWxpZGF0ZUFsbCkge1xuICAgICAgZ2wyLmludmFsaWRhdGVGcmFtZWJ1ZmZlcigzNjAwOCwgYXR0YWNobWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbDIuaW52YWxpZGF0ZUZyYW1lYnVmZmVyKDM2MDA4LCBhdHRhY2htZW50cywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgZ2wyLmJpbmRGcmFtZWJ1ZmZlcigzNjAwOCwgcHJldkhhbmRsZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRBdHRhY2htZW50UGFyYW1ldGVyKGF0dGFjaG1lbnQsIHBuYW1lLCBrZXlzKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fZ2V0QXR0YWNobWVudFBhcmFtZXRlckZhbGxiYWNrKHBuYW1lKTtcblxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHRoaXMuaGFuZGxlKTtcbiAgICAgIHZhbHVlID0gdGhpcy5nbC5nZXRGcmFtZWJ1ZmZlckF0dGFjaG1lbnRQYXJhbWV0ZXIoMzYxNjAsIGF0dGFjaG1lbnQsIHBuYW1lKTtcbiAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAoa2V5cyAmJiB2YWx1ZSA+IDEwMDApIHtcbiAgICAgIHZhbHVlID0gZ2V0S2V5KHRoaXMuZ2wsIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBnZXRBdHRhY2htZW50UGFyYW1ldGVycyhhdHRhY2htZW50ID0gMzYwNjQsIGtleXMsIHBhcmFtZXRlcnMgPSB0aGlzLmNvbnN0cnVjdG9yLkFUVEFDSE1FTlRfUEFSQU1FVEVSUyB8fCBbXSkge1xuICAgIGNvbnN0IHZhbHVlcyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBwbmFtZSBvZiBwYXJhbWV0ZXJzKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlzID8gZ2V0S2V5KHRoaXMuZ2wsIHBuYW1lKSA6IHBuYW1lO1xuICAgICAgdmFsdWVzW2tleV0gPSB0aGlzLmdldEF0dGFjaG1lbnRQYXJhbWV0ZXIoYXR0YWNobWVudCwgcG5hbWUsIGtleXMpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH1cblxuICBnZXRQYXJhbWV0ZXJzKGtleXMgPSB0cnVlKSB7XG4gICAgY29uc3QgYXR0YWNobWVudHMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dGFjaG1lbnRzKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGF0dGFjaG1lbnROYW1lIG9mIGF0dGFjaG1lbnRzKSB7XG4gICAgICBjb25zdCBhdHRhY2htZW50ID0gTnVtYmVyKGF0dGFjaG1lbnROYW1lKTtcbiAgICAgIGNvbnN0IGtleSA9IGtleXMgPyBnZXRLZXkodGhpcy5nbCwgYXR0YWNobWVudCkgOiBhdHRhY2htZW50O1xuICAgICAgcGFyYW1ldGVyc1trZXldID0gdGhpcy5nZXRBdHRhY2htZW50UGFyYW1ldGVycyhhdHRhY2htZW50LCBrZXlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cub3Blbihjb3B5VG9EYXRhVXJsKHRoaXMpLCAnbHVtYS1kZWJ1Zy10ZXh0dXJlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsb2cobG9nTGV2ZWwgPSAwLCBtZXNzYWdlID0gJycpIHtcbiAgICBpZiAobG9nTGV2ZWwgPiBsb2cubGV2ZWwgfHwgdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1lc3NhZ2UgPSBtZXNzYWdlIHx8IGBGcmFtZWJ1ZmZlciAke3RoaXMuaWR9YDtcbiAgICBjb25zdCBpbWFnZSA9IGNvcHlUb0RhdGFVcmwodGhpcywge1xuICAgICAgdGFyZ2V0TWF4SGVpZ2h0OiAxMDBcbiAgICB9KTtcbiAgICBsb2cuaW1hZ2Uoe1xuICAgICAgbG9nTGV2ZWwsXG4gICAgICBtZXNzYWdlLFxuICAgICAgaW1hZ2VcbiAgICB9LCBtZXNzYWdlKSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYmluZCh7XG4gICAgdGFyZ2V0ID0gMzYxNjBcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1bmJpbmQoe1xuICAgIHRhcmdldCA9IDM2MTYwXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfY3JlYXRlRGVmYXVsdEF0dGFjaG1lbnRzKGNvbG9yLCBkZXB0aCwgc3RlbmNpbCwgd2lkdGgsIGhlaWdodCkge1xuICAgIGxldCBkZWZhdWx0QXR0YWNobWVudHMgPSBudWxsO1xuXG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHMgPSBkZWZhdWx0QXR0YWNobWVudHMgfHwge307XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHNbMzYwNjRdID0gbmV3IFRleHR1cmUyRCh0aGlzLmdsLCB7XG4gICAgICAgIGlkOiBgJHt0aGlzLmlkfS1jb2xvcjBgLFxuICAgICAgICBwaXhlbHM6IG51bGwsXG4gICAgICAgIGZvcm1hdDogNjQwOCxcbiAgICAgICAgdHlwZTogNTEyMSxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgbWlwbWFwczogZmFsc2UsXG4gICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBbMTAyNDFdOiA5NzI5LFxuICAgICAgICAgIFsxMDI0MF06IDk3MjksXG4gICAgICAgICAgWzEwMjQyXTogMzMwNzEsXG4gICAgICAgICAgWzEwMjQzXTogMzMwNzFcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLm93blJlc291cmNlcy5wdXNoKGRlZmF1bHRBdHRhY2htZW50c1szNjA2NF0pO1xuICAgIH1cblxuICAgIGlmIChkZXB0aCAmJiBzdGVuY2lsKSB7XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHMgPSBkZWZhdWx0QXR0YWNobWVudHMgfHwge307XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHNbMzMzMDZdID0gbmV3IFJlbmRlcmJ1ZmZlcih0aGlzLmdsLCB7XG4gICAgICAgIGlkOiBgJHt0aGlzLmlkfS1kZXB0aC1zdGVuY2lsYCxcbiAgICAgICAgZm9ybWF0OiAzNTA1NixcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodDogMTExXG4gICAgICB9KTtcbiAgICAgIHRoaXMub3duUmVzb3VyY2VzLnB1c2goZGVmYXVsdEF0dGFjaG1lbnRzWzMzMzA2XSk7XG4gICAgfSBlbHNlIGlmIChkZXB0aCkge1xuICAgICAgZGVmYXVsdEF0dGFjaG1lbnRzID0gZGVmYXVsdEF0dGFjaG1lbnRzIHx8IHt9O1xuICAgICAgZGVmYXVsdEF0dGFjaG1lbnRzWzM2MDk2XSA9IG5ldyBSZW5kZXJidWZmZXIodGhpcy5nbCwge1xuICAgICAgICBpZDogYCR7dGhpcy5pZH0tZGVwdGhgLFxuICAgICAgICBmb3JtYXQ6IDMzMTg5LFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0XG4gICAgICB9KTtcbiAgICAgIHRoaXMub3duUmVzb3VyY2VzLnB1c2goZGVmYXVsdEF0dGFjaG1lbnRzWzM2MDk2XSk7XG4gICAgfSBlbHNlIGlmIChzdGVuY2lsKSB7XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0QXR0YWNobWVudHM7XG4gIH1cblxuICBfdW5hdHRhY2goYXR0YWNobWVudCkge1xuICAgIGNvbnN0IG9sZEF0dGFjaG1lbnQgPSB0aGlzLmF0dGFjaG1lbnRzW2F0dGFjaG1lbnRdO1xuXG4gICAgaWYgKCFvbGRBdHRhY2htZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG9sZEF0dGFjaG1lbnQgaW5zdGFuY2VvZiBSZW5kZXJidWZmZXIpIHtcbiAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoMzYxNjAsIGF0dGFjaG1lbnQsIDM2MTYxLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclRleHR1cmUyRCgzNjE2MCwgYXR0YWNobWVudCwgMzU1MywgbnVsbCwgMCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMuYXR0YWNobWVudHNbYXR0YWNobWVudF07XG4gIH1cblxuICBfYXR0YWNoUmVuZGVyYnVmZmVyKHtcbiAgICBhdHRhY2htZW50ID0gMzYwNjQsXG4gICAgcmVuZGVyYnVmZmVyXG4gIH0pIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKDM2MTYwLCBhdHRhY2htZW50LCAzNjE2MSwgcmVuZGVyYnVmZmVyLmhhbmRsZSk7XG4gICAgdGhpcy5hdHRhY2htZW50c1thdHRhY2htZW50XSA9IHJlbmRlcmJ1ZmZlcjtcbiAgfVxuXG4gIF9hdHRhY2hUZXh0dXJlKHtcbiAgICBhdHRhY2htZW50ID0gMzYwNjQsXG4gICAgdGV4dHVyZSxcbiAgICBsYXllcixcbiAgICBsZXZlbFxuICB9KSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgdGV4dHVyZS5oYW5kbGUpO1xuXG4gICAgc3dpdGNoICh0ZXh0dXJlLnRhcmdldCkge1xuICAgICAgY2FzZSAzNTg2NjpcbiAgICAgIGNhc2UgMzI4Nzk6XG4gICAgICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQoZ2wpO1xuICAgICAgICBnbDIuZnJhbWVidWZmZXJUZXh0dXJlTGF5ZXIoMzYxNjAsIGF0dGFjaG1lbnQsIHRleHR1cmUudGFyZ2V0LCBsZXZlbCwgbGF5ZXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzNDA2NzpcbiAgICAgICAgY29uc3QgZmFjZSA9IG1hcEluZGV4VG9DdWJlTWFwRmFjZShsYXllcik7XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKDM2MTYwLCBhdHRhY2htZW50LCBmYWNlLCB0ZXh0dXJlLmhhbmRsZSwgbGV2ZWwpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzNTUzOlxuICAgICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRCgzNjE2MCwgYXR0YWNobWVudCwgMzU1MywgdGV4dHVyZS5oYW5kbGUsIGxldmVsKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSwgJ0lsbGVnYWwgdGV4dHVyZSB0eXBlJyk7XG4gICAgfVxuXG4gICAgZ2wuYmluZFRleHR1cmUodGV4dHVyZS50YXJnZXQsIG51bGwpO1xuICAgIHRoaXMuYXR0YWNobWVudHNbYXR0YWNobWVudF0gPSB0ZXh0dXJlO1xuICB9XG5cbiAgX3NldFJlYWRCdWZmZXIocmVhZEJ1ZmZlcikge1xuICAgIGNvbnN0IGdsMiA9IGdldFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG5cbiAgICBpZiAoZ2wyKSB7XG4gICAgICBnbDIucmVhZEJ1ZmZlcihyZWFkQnVmZmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXJ0KHJlYWRCdWZmZXIgPT09IDM2MDY0IHx8IHJlYWRCdWZmZXIgPT09IDEwMjksIEVSUl9NVUxUSVBMRV9SRU5ERVJUQVJHRVRTKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlYWRCdWZmZXIgPSByZWFkQnVmZmVyO1xuICB9XG5cbiAgX3NldERyYXdCdWZmZXJzKGRyYXdCdWZmZXJzKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcblxuICAgIGlmIChnbDIpIHtcbiAgICAgIGdsMi5kcmF3QnVmZmVycyhkcmF3QnVmZmVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfZHJhd19idWZmZXJzJyk7XG5cbiAgICAgIGlmIChleHQpIHtcbiAgICAgICAgZXh0LmRyYXdCdWZmZXJzV0VCR0woZHJhd0J1ZmZlcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0KGRyYXdCdWZmZXJzLmxlbmd0aCA9PT0gMSAmJiAoZHJhd0J1ZmZlcnNbMF0gPT09IDM2MDY0IHx8IGRyYXdCdWZmZXJzWzBdID09PSAxMDI5KSwgRVJSX01VTFRJUExFX1JFTkRFUlRBUkdFVFMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZHJhd0J1ZmZlcnMgPSBkcmF3QnVmZmVycztcbiAgfVxuXG4gIF9nZXRBdHRhY2htZW50UGFyYW1ldGVyRmFsbGJhY2socG5hbWUpIHtcbiAgICBjb25zdCBjYXBzID0gZ2V0RmVhdHVyZXModGhpcy5nbCk7XG5cbiAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICBjYXNlIDM2MDUyOlxuICAgICAgICByZXR1cm4gIWNhcHMuV0VCR0wyID8gMCA6IG51bGw7XG5cbiAgICAgIGNhc2UgMzMyOTg6XG4gICAgICBjYXNlIDMzMjk5OlxuICAgICAgY2FzZSAzMzMwMDpcbiAgICAgIGNhc2UgMzMzMDE6XG4gICAgICBjYXNlIDMzMzAyOlxuICAgICAgY2FzZSAzMzMwMzpcbiAgICAgICAgcmV0dXJuICFjYXBzLldFQkdMMiA/IDggOiBudWxsO1xuXG4gICAgICBjYXNlIDMzMjk3OlxuICAgICAgICByZXR1cm4gIWNhcHMuV0VCR0wyID8gNTEyNSA6IG51bGw7XG5cbiAgICAgIGNhc2UgMzMyOTY6XG4gICAgICAgIHJldHVybiAhY2Fwcy5XRUJHTDIgJiYgIWNhcHMuRVhUX3NSR0IgPyA5NzI5IDogbnVsbDtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aGlzLmdsLmRlbGV0ZUZyYW1lYnVmZmVyKHRoaXMuaGFuZGxlKTtcbiAgfVxuXG4gIF9iaW5kSGFuZGxlKGhhbmRsZSkge1xuICAgIHJldHVybiB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgaGFuZGxlKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIG1hcEluZGV4VG9DdWJlTWFwRmFjZShsYXllcikge1xuICByZXR1cm4gbGF5ZXIgPCAzNDA2OSA/IGxheWVyICsgMzQwNjkgOiBsYXllcjtcbn1cblxuZnVuY3Rpb24gX2dldEZyYW1lQnVmZmVyU3RhdHVzKHN0YXR1cykge1xuICBjb25zdCBTVEFUVVMgPSBGcmFtZWJ1ZmZlci5TVEFUVVMgfHwge307XG4gIHJldHVybiBTVEFUVVNbc3RhdHVzXSB8fCBgRnJhbWVidWZmZXIgZXJyb3IgJHtzdGF0dXN9YDtcbn1cblxuZXhwb3J0IGNvbnN0IEZSQU1FQlVGRkVSX0FUVEFDSE1FTlRfUEFSQU1FVEVSUyA9IFszNjA0OSwgMzYwNDgsIDMzMjk2LCAzMzI5OCwgMzMyOTksIDMzMzAwLCAzMzMwMSwgMzMzMDIsIDMzMzAzXTtcbkZyYW1lYnVmZmVyLkFUVEFDSE1FTlRfUEFSQU1FVEVSUyA9IEZSQU1FQlVGRkVSX0FUVEFDSE1FTlRfUEFSQU1FVEVSUztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZyYW1lYnVmZmVyLmpzLm1hcCIsImltcG9ydCBBY2Nlc3NvciBmcm9tICcuL2FjY2Vzc29yJztcbmltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBkZWNvbXBvc2VDb21wb3NpdGVHTFR5cGUgfSBmcm9tICcuLi93ZWJnbC11dGlscy9hdHRyaWJ1dGUtdXRpbHMnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZ3JhbUNvbmZpZ3VyYXRpb24ge1xuICBjb25zdHJ1Y3Rvcihwcm9ncmFtKSB7XG4gICAgdGhpcy5pZCA9IHByb2dyYW0uaWQ7XG4gICAgdGhpcy5hdHRyaWJ1dGVJbmZvcyA9IFtdO1xuICAgIHRoaXMuYXR0cmlidXRlSW5mb3NCeU5hbWUgPSB7fTtcbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zQnlMb2NhdGlvbiA9IFtdO1xuICAgIHRoaXMudmFyeWluZ0luZm9zID0gW107XG4gICAgdGhpcy52YXJ5aW5nSW5mb3NCeU5hbWUgPSB7fTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcblxuICAgIHRoaXMuX3JlYWRBdHRyaWJ1dGVzRnJvbVByb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICB0aGlzLl9yZWFkVmFyeWluZ3NGcm9tUHJvZ3JhbShwcm9ncmFtKTtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUluZm8obG9jYXRpb25Pck5hbWUpIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IE51bWJlcihsb2NhdGlvbk9yTmFtZSk7XG5cbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGxvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlSW5mb3NCeUxvY2F0aW9uW2xvY2F0aW9uXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVJbmZvc0J5TmFtZVtsb2NhdGlvbk9yTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUxvY2F0aW9uKGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgY29uc3QgYXR0cmlidXRlSW5mbyA9IHRoaXMuZ2V0QXR0cmlidXRlSW5mbyhsb2NhdGlvbk9yTmFtZSk7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZUluZm8gPyBhdHRyaWJ1dGVJbmZvLmxvY2F0aW9uIDogLTE7XG4gIH1cblxuICBnZXRBdHRyaWJ1dGVBY2Nlc3Nvcihsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZUluZm8gPSB0aGlzLmdldEF0dHJpYnV0ZUluZm8obG9jYXRpb25Pck5hbWUpO1xuICAgIHJldHVybiBhdHRyaWJ1dGVJbmZvID8gYXR0cmlidXRlSW5mby5hY2Nlc3NvciA6IG51bGw7XG4gIH1cblxuICBnZXRWYXJ5aW5nSW5mbyhsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uT3JOYW1lKTtcblxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy52YXJ5aW5nSW5mb3NbbG9jYXRpb25dO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZhcnlpbmdJbmZvc0J5TmFtZVtsb2NhdGlvbk9yTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGdldFZhcnlpbmdJbmRleChsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IHZhcnlpbmcgPSB0aGlzLmdldFZhcnlpbmdJbmZvKCk7XG4gICAgcmV0dXJuIHZhcnlpbmcgPyB2YXJ5aW5nLmxvY2F0aW9uIDogLTE7XG4gIH1cblxuICBnZXRWYXJ5aW5nQWNjZXNzb3IobG9jYXRpb25Pck5hbWUpIHtcbiAgICBjb25zdCB2YXJ5aW5nID0gdGhpcy5nZXRWYXJ5aW5nSW5mbygpO1xuICAgIHJldHVybiB2YXJ5aW5nID8gdmFyeWluZy5hY2Nlc3NvciA6IG51bGw7XG4gIH1cblxuICBfcmVhZEF0dHJpYnV0ZXNGcm9tUHJvZ3JhbShwcm9ncmFtKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gcHJvZ3JhbTtcbiAgICBjb25zdCBjb3VudCA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbS5oYW5kbGUsIDM1NzIxKTtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjb3VudDsgaW5kZXgrKykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBuYW1lLFxuICAgICAgICB0eXBlLFxuICAgICAgICBzaXplXG4gICAgICB9ID0gZ2wuZ2V0QWN0aXZlQXR0cmliKHByb2dyYW0uaGFuZGxlLCBpbmRleCk7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0uaGFuZGxlLCBuYW1lKTtcblxuICAgICAgaWYgKGxvY2F0aW9uID49IDApIHtcbiAgICAgICAgdGhpcy5fYWRkQXR0cmlidXRlKGxvY2F0aW9uLCBuYW1lLCB0eXBlLCBzaXplKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zLnNvcnQoKGEsIGIpID0+IGEubG9jYXRpb24gLSBiLmxvY2F0aW9uKTtcbiAgfVxuXG4gIF9yZWFkVmFyeWluZ3NGcm9tUHJvZ3JhbShwcm9ncmFtKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gcHJvZ3JhbTtcblxuICAgIGlmICghaXNXZWJHTDIoZ2wpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY291bnQgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0uaGFuZGxlLCAzNTk3MSk7XG5cbiAgICBmb3IgKGxldCBsb2NhdGlvbiA9IDA7IGxvY2F0aW9uIDwgY291bnQ7IGxvY2F0aW9uKyspIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgc2l6ZVxuICAgICAgfSA9IGdsLmdldFRyYW5zZm9ybUZlZWRiYWNrVmFyeWluZyhwcm9ncmFtLmhhbmRsZSwgbG9jYXRpb24pO1xuXG4gICAgICB0aGlzLl9hZGRWYXJ5aW5nKGxvY2F0aW9uLCBuYW1lLCB0eXBlLCBzaXplKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhcnlpbmdJbmZvcy5zb3J0KChhLCBiKSA9PiBhLmxvY2F0aW9uIC0gYi5sb2NhdGlvbik7XG4gIH1cblxuICBfYWRkQXR0cmlidXRlKGxvY2F0aW9uLCBuYW1lLCBjb21wb3NpdGVUeXBlLCBzaXplKSB7XG4gICAgY29uc3Qge1xuICAgICAgdHlwZSxcbiAgICAgIGNvbXBvbmVudHNcbiAgICB9ID0gZGVjb21wb3NlQ29tcG9zaXRlR0xUeXBlKGNvbXBvc2l0ZVR5cGUpO1xuICAgIGNvbnN0IGFjY2Vzc29yID0ge1xuICAgICAgdHlwZSxcbiAgICAgIHNpemU6IHNpemUgKiBjb21wb25lbnRzXG4gICAgfTtcblxuICAgIHRoaXMuX2luZmVyUHJvcGVydGllcyhsb2NhdGlvbiwgbmFtZSwgYWNjZXNzb3IpO1xuXG4gICAgY29uc3QgYXR0cmlidXRlSW5mbyA9IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgbmFtZSxcbiAgICAgIGFjY2Vzc29yOiBuZXcgQWNjZXNzb3IoYWNjZXNzb3IpXG4gICAgfTtcbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zLnB1c2goYXR0cmlidXRlSW5mbyk7XG4gICAgdGhpcy5hdHRyaWJ1dGVJbmZvc0J5TG9jYXRpb25bbG9jYXRpb25dID0gYXR0cmlidXRlSW5mbztcbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zQnlOYW1lW2F0dHJpYnV0ZUluZm8ubmFtZV0gPSBhdHRyaWJ1dGVJbmZvO1xuICB9XG5cbiAgX2luZmVyUHJvcGVydGllcyhsb2NhdGlvbiwgbmFtZSwgYWNjZXNzb3IpIHtcbiAgICBpZiAoL2luc3RhbmNlL2kudGVzdChuYW1lKSkge1xuICAgICAgYWNjZXNzb3IuZGl2aXNvciA9IDE7XG4gICAgfVxuICB9XG5cbiAgX2FkZFZhcnlpbmcobG9jYXRpb24sIG5hbWUsIGNvbXBvc2l0ZVR5cGUsIHNpemUpIHtcbiAgICBjb25zdCB7XG4gICAgICB0eXBlLFxuICAgICAgY29tcG9uZW50c1xuICAgIH0gPSBkZWNvbXBvc2VDb21wb3NpdGVHTFR5cGUoY29tcG9zaXRlVHlwZSk7XG4gICAgY29uc3QgYWNjZXNzb3IgPSBuZXcgQWNjZXNzb3Ioe1xuICAgICAgdHlwZSxcbiAgICAgIHNpemU6IHNpemUgKiBjb21wb25lbnRzXG4gICAgfSk7XG4gICAgY29uc3QgdmFyeWluZyA9IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgbmFtZSxcbiAgICAgIGFjY2Vzc29yXG4gICAgfTtcbiAgICB0aGlzLnZhcnlpbmdJbmZvcy5wdXNoKHZhcnlpbmcpO1xuICAgIHRoaXMudmFyeWluZ0luZm9zQnlOYW1lW3ZhcnlpbmcubmFtZV0gPSB2YXJ5aW5nO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb2dyYW0tY29uZmlndXJhdGlvbi5qcy5tYXAiLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuaW1wb3J0IEZyYW1lYnVmZmVyIGZyb20gJy4vZnJhbWVidWZmZXInO1xuaW1wb3J0IHsgcGFyc2VVbmlmb3JtTmFtZSwgZ2V0VW5pZm9ybVNldHRlciB9IGZyb20gJy4vdW5pZm9ybXMnO1xuaW1wb3J0IHsgVmVydGV4U2hhZGVyLCBGcmFnbWVudFNoYWRlciB9IGZyb20gJy4vc2hhZGVyJztcbmltcG9ydCBQcm9ncmFtQ29uZmlndXJhdGlvbiBmcm9tICcuL3Byb2dyYW0tY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBjb3B5VW5pZm9ybSwgY2hlY2tVbmlmb3JtVmFsdWVzIH0gZnJvbSAnLi91bmlmb3Jtcyc7XG5pbXBvcnQgeyBpc1dlYkdMMiwgYXNzZXJ0V2ViR0wyQ29udGV4dCwgd2l0aFBhcmFtZXRlcnMsIGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgZ2V0S2V5IH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvY29uc3RhbnRzLXRvLWtleXMnO1xuaW1wb3J0IHsgZ2V0UHJpbWl0aXZlRHJhd01vZGUgfSBmcm9tICcuLi93ZWJnbC11dGlscy9hdHRyaWJ1dGUtdXRpbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IHVpZCB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcbmNvbnN0IExPR19QUk9HUkFNX1BFUkZfUFJJT1JJVFkgPSA0O1xuY29uc3QgR0xfU0VQQVJBVEVfQVRUUklCUyA9IDB4OGM4ZDtcbmNvbnN0IFY2X0RFUFJFQ0FURURfTUVUSE9EUyA9IFsnc2V0VmVydGV4QXJyYXknLCAnc2V0QXR0cmlidXRlcycsICdzZXRCdWZmZXJzJywgJ3Vuc2V0QnVmZmVycycsICd1c2UnLCAnZ2V0VW5pZm9ybUNvdW50JywgJ2dldFVuaWZvcm1JbmZvJywgJ2dldFVuaWZvcm1Mb2NhdGlvbicsICdnZXRVbmlmb3JtVmFsdWUnLCAnZ2V0VmFyeWluZycsICdnZXRGcmFnRGF0YUxvY2F0aW9uJywgJ2dldEF0dGFjaGVkU2hhZGVycycsICdnZXRBdHRyaWJ1dGVDb3VudCcsICdnZXRBdHRyaWJ1dGVMb2NhdGlvbicsICdnZXRBdHRyaWJ1dGVJbmZvJ107XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9ncmFtIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMgPSB7fSkge1xuICAgIHN1cGVyKGdsLCBwcm9wcyk7XG4gICAgdGhpcy5zdHViUmVtb3ZlZE1ldGhvZHMoJ1Byb2dyYW0nLCAndjYuMCcsIFY2X0RFUFJFQ0FURURfTUVUSE9EUyk7XG4gICAgdGhpcy5faXNDYWNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuXG4gICAgdGhpcy5fc2V0SWQocHJvcHMuaWQpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShwcm9wcyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgaGFzaCxcbiAgICAgIHZzLFxuICAgICAgZnMsXG4gICAgICB2YXJ5aW5ncyxcbiAgICAgIGJ1ZmZlck1vZGUgPSBHTF9TRVBBUkFURV9BVFRSSUJTXG4gICAgfSA9IHByb3BzO1xuICAgIHRoaXMuaGFzaCA9IGhhc2ggfHwgJyc7XG4gICAgdGhpcy52cyA9IHR5cGVvZiB2cyA9PT0gJ3N0cmluZycgPyBuZXcgVmVydGV4U2hhZGVyKHRoaXMuZ2wsIHtcbiAgICAgIGlkOiBgJHtwcm9wcy5pZH0tdnNgLFxuICAgICAgc291cmNlOiB2c1xuICAgIH0pIDogdnM7XG4gICAgdGhpcy5mcyA9IHR5cGVvZiBmcyA9PT0gJ3N0cmluZycgPyBuZXcgRnJhZ21lbnRTaGFkZXIodGhpcy5nbCwge1xuICAgICAgaWQ6IGAke3Byb3BzLmlkfS1mc2AsXG4gICAgICBzb3VyY2U6IGZzXG4gICAgfSkgOiBmcztcbiAgICBhc3NlcnQodGhpcy52cyBpbnN0YW5jZW9mIFZlcnRleFNoYWRlcik7XG4gICAgYXNzZXJ0KHRoaXMuZnMgaW5zdGFuY2VvZiBGcmFnbWVudFNoYWRlcik7XG4gICAgdGhpcy51bmlmb3JtcyA9IHt9O1xuICAgIHRoaXMuX3RleHR1cmVVbmlmb3JtcyA9IHt9O1xuXG4gICAgaWYgKHZhcnlpbmdzICYmIHZhcnlpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgICB0aGlzLnZhcnlpbmdzID0gdmFyeWluZ3M7XG4gICAgICB0aGlzLmdsMi50cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzKHRoaXMuaGFuZGxlLCB2YXJ5aW5ncywgYnVmZmVyTW9kZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29tcGlsZUFuZExpbmsoKTtcblxuICAgIHRoaXMuX3JlYWRVbmlmb3JtTG9jYXRpb25zRnJvbUxpbmtlZFByb2dyYW0oKTtcblxuICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IG5ldyBQcm9ncmFtQ29uZmlndXJhdGlvbih0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5zZXRQcm9wcyhwcm9wcyk7XG4gIH1cblxuICBkZWxldGUob3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKHRoaXMuX2lzQ2FjaGVkKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKG9wdGlvbnMpO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoJ3VuaWZvcm1zJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRVbmlmb3Jtcyhwcm9wcy51bmlmb3Jtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkcmF3KHtcbiAgICBsb2dQcmlvcml0eSxcbiAgICBkcmF3TW9kZSA9IDQsXG4gICAgdmVydGV4Q291bnQsXG4gICAgb2Zmc2V0ID0gMCxcbiAgICBzdGFydCxcbiAgICBlbmQsXG4gICAgaXNJbmRleGVkID0gZmFsc2UsXG4gICAgaW5kZXhUeXBlID0gNTEyMyxcbiAgICBpbnN0YW5jZUNvdW50ID0gMCxcbiAgICBpc0luc3RhbmNlZCA9IGluc3RhbmNlQ291bnQgPiAwLFxuICAgIHZlcnRleEFycmF5ID0gbnVsbCxcbiAgICB0cmFuc2Zvcm1GZWVkYmFjayxcbiAgICBmcmFtZWJ1ZmZlcixcbiAgICBwYXJhbWV0ZXJzID0ge30sXG4gICAgdW5pZm9ybXMsXG4gICAgc2FtcGxlcnNcbiAgfSkge1xuICAgIGlmICh1bmlmb3JtcyB8fCBzYW1wbGVycykge1xuICAgICAgbG9nLmRlcHJlY2F0ZWQoJ1Byb2dyYW0uZHJhdyh7dW5pZm9ybXN9KScsICdQcm9ncmFtLnNldFVuaWZvcm1zKHVuaWZvcm1zKScpKCk7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHVuaWZvcm1zIHx8IHt9KTtcbiAgICB9XG5cbiAgICBpZiAobG9nLnByaW9yaXR5ID49IGxvZ1ByaW9yaXR5KSB7XG4gICAgICBjb25zdCBmYiA9IGZyYW1lYnVmZmVyID8gZnJhbWVidWZmZXIuaWQgOiAnZGVmYXVsdCc7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYG1vZGU9JHtnZXRLZXkodGhpcy5nbCwgZHJhd01vZGUpfSB2ZXJ0cz0ke3ZlcnRleENvdW50fSBgICsgYGluc3RhbmNlcz0ke2luc3RhbmNlQ291bnR9IGluZGV4VHlwZT0ke2dldEtleSh0aGlzLmdsLCBpbmRleFR5cGUpfSBgICsgYGlzSW5zdGFuY2VkPSR7aXNJbnN0YW5jZWR9IGlzSW5kZXhlZD0ke2lzSW5kZXhlZH0gYCArIGBGcmFtZWJ1ZmZlcj0ke2ZifWA7XG4gICAgICBsb2cubG9nKGxvZ1ByaW9yaXR5LCBtZXNzYWdlKSgpO1xuICAgIH1cblxuICAgIGFzc2VydCh2ZXJ0ZXhBcnJheSk7XG4gICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMuaGFuZGxlKTtcblxuICAgIGlmICghdGhpcy5fYXJlVGV4dHVyZXNSZW5kZXJhYmxlKCkgfHwgdmVydGV4Q291bnQgPT09IDAgfHwgaXNJbnN0YW5jZWQgJiYgaW5zdGFuY2VDb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZlcnRleEFycmF5LmJpbmRGb3JEcmF3KHZlcnRleENvdW50LCBpbnN0YW5jZUNvdW50LCAoKSA9PiB7XG4gICAgICBpZiAoZnJhbWVidWZmZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgcGFyYW1ldGVycywge1xuICAgICAgICAgIGZyYW1lYnVmZmVyXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhbnNmb3JtRmVlZGJhY2spIHtcbiAgICAgICAgY29uc3QgcHJpbWl0aXZlTW9kZSA9IGdldFByaW1pdGl2ZURyYXdNb2RlKGRyYXdNb2RlKTtcbiAgICAgICAgdHJhbnNmb3JtRmVlZGJhY2suYmVnaW4ocHJpbWl0aXZlTW9kZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2JpbmRUZXh0dXJlcygpO1xuXG4gICAgICB3aXRoUGFyYW1ldGVycyh0aGlzLmdsLCBwYXJhbWV0ZXJzLCAoKSA9PiB7XG4gICAgICAgIGlmIChpc0luZGV4ZWQgJiYgaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICB0aGlzLmdsMi5kcmF3RWxlbWVudHNJbnN0YW5jZWQoZHJhd01vZGUsIHZlcnRleENvdW50LCBpbmRleFR5cGUsIG9mZnNldCwgaW5zdGFuY2VDb3VudCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNJbmRleGVkICYmIGlzV2ViR0wyKHRoaXMuZ2wpICYmICFpc05hTihzdGFydCkgJiYgIWlzTmFOKGVuZCkpIHtcbiAgICAgICAgICB0aGlzLmdsMi5kcmF3UmFuZ2VFbGVtZW50cyhkcmF3TW9kZSwgc3RhcnQsIGVuZCwgdmVydGV4Q291bnQsIGluZGV4VHlwZSwgb2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0luZGV4ZWQpIHtcbiAgICAgICAgICB0aGlzLmdsLmRyYXdFbGVtZW50cyhkcmF3TW9kZSwgdmVydGV4Q291bnQsIGluZGV4VHlwZSwgb2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0luc3RhbmNlZCkge1xuICAgICAgICAgIHRoaXMuZ2wyLmRyYXdBcnJheXNJbnN0YW5jZWQoZHJhd01vZGUsIG9mZnNldCwgdmVydGV4Q291bnQsIGluc3RhbmNlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZ2wuZHJhd0FycmF5cyhkcmF3TW9kZSwgb2Zmc2V0LCB2ZXJ0ZXhDb3VudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHJhbnNmb3JtRmVlZGJhY2spIHtcbiAgICAgICAgdHJhbnNmb3JtRmVlZGJhY2suZW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzZXRVbmlmb3Jtcyh1bmlmb3JtcyA9IHt9KSB7XG4gICAgaWYgKGxvZy5wcmlvcml0eSA+PSAyKSB7XG4gICAgICBjaGVja1VuaWZvcm1WYWx1ZXModW5pZm9ybXMsIHRoaXMuaWQsIHRoaXMuX3VuaWZvcm1TZXR0ZXJzKTtcbiAgICB9XG5cbiAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5oYW5kbGUpO1xuXG4gICAgZm9yIChjb25zdCB1bmlmb3JtTmFtZSBpbiB1bmlmb3Jtcykge1xuICAgICAgY29uc3QgdW5pZm9ybSA9IHVuaWZvcm1zW3VuaWZvcm1OYW1lXTtcbiAgICAgIGNvbnN0IHVuaWZvcm1TZXR0ZXIgPSB0aGlzLl91bmlmb3JtU2V0dGVyc1t1bmlmb3JtTmFtZV07XG5cbiAgICAgIGlmICh1bmlmb3JtU2V0dGVyKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHVuaWZvcm07XG4gICAgICAgIGxldCB0ZXh0dXJlVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRnJhbWVidWZmZXIpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRleHR1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUZXh0dXJlKSB7XG4gICAgICAgICAgdGV4dHVyZVVwZGF0ZSA9IHRoaXMudW5pZm9ybXNbdW5pZm9ybU5hbWVdICE9PSB1bmlmb3JtO1xuXG4gICAgICAgICAgaWYgKHRleHR1cmVVcGRhdGUpIHtcbiAgICAgICAgICAgIGlmICh1bmlmb3JtU2V0dGVyLnRleHR1cmVJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHVuaWZvcm1TZXR0ZXIudGV4dHVyZUluZGV4ID0gdGhpcy5fdGV4dHVyZUluZGV4Q291bnRlcisrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gdmFsdWU7XG4gICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgIHRleHR1cmVJbmRleFxuICAgICAgICAgICAgfSA9IHVuaWZvcm1TZXR0ZXI7XG4gICAgICAgICAgICB0ZXh0dXJlLmJpbmQodGV4dHVyZUluZGV4KTtcbiAgICAgICAgICAgIHZhbHVlID0gdGV4dHVyZUluZGV4O1xuICAgICAgICAgICAgdGhpcy5fdGV4dHVyZVVuaWZvcm1zW3VuaWZvcm1OYW1lXSA9IHRleHR1cmU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdW5pZm9ybVNldHRlci50ZXh0dXJlSW5kZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3RleHR1cmVVbmlmb3Jtc1t1bmlmb3JtTmFtZV0pIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fdGV4dHVyZVVuaWZvcm1zW3VuaWZvcm1OYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1bmlmb3JtU2V0dGVyKHZhbHVlKSB8fCB0ZXh0dXJlVXBkYXRlKSB7XG4gICAgICAgICAgY29weVVuaWZvcm0odGhpcy51bmlmb3JtcywgdW5pZm9ybU5hbWUsIHVuaWZvcm0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfYXJlVGV4dHVyZXNSZW5kZXJhYmxlKCkge1xuICAgIGxldCB0ZXh0dXJlc1JlbmRlcmFibGUgPSB0cnVlO1xuXG4gICAgZm9yIChjb25zdCB1bmlmb3JtTmFtZSBpbiB0aGlzLl90ZXh0dXJlVW5pZm9ybXMpIHtcbiAgICAgIGNvbnN0IHRleHR1cmUgPSB0aGlzLl90ZXh0dXJlVW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuICAgICAgdGV4dHVyZS51cGRhdGUoKTtcbiAgICAgIHRleHR1cmVzUmVuZGVyYWJsZSA9IHRleHR1cmVzUmVuZGVyYWJsZSAmJiB0ZXh0dXJlLmxvYWRlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGV4dHVyZXNSZW5kZXJhYmxlO1xuICB9XG5cbiAgX2JpbmRUZXh0dXJlcygpIHtcbiAgICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIGluIHRoaXMuX3RleHR1cmVVbmlmb3Jtcykge1xuICAgICAgY29uc3QgdGV4dHVyZUluZGV4ID0gdGhpcy5fdW5pZm9ybVNldHRlcnNbdW5pZm9ybU5hbWVdLnRleHR1cmVJbmRleDtcblxuICAgICAgdGhpcy5fdGV4dHVyZVVuaWZvcm1zW3VuaWZvcm1OYW1lXS5iaW5kKHRleHR1cmVJbmRleCk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVQcm9ncmFtKCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLmhhbmRsZSk7XG4gIH1cblxuICBfZ2V0T3B0aW9uc0Zyb21IYW5kbGUoaGFuZGxlKSB7XG4gICAgY29uc3Qgc2hhZGVySGFuZGxlcyA9IHRoaXMuZ2wuZ2V0QXR0YWNoZWRTaGFkZXJzKGhhbmRsZSk7XG4gICAgY29uc3Qgb3B0cyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBzaGFkZXJIYW5kbGUgb2Ygc2hhZGVySGFuZGxlcykge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHRoaXMuaGFuZGxlLCAzNTY2Myk7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIDM1NjMzOlxuICAgICAgICAgIG9wdHMudnMgPSBuZXcgVmVydGV4U2hhZGVyKHtcbiAgICAgICAgICAgIGhhbmRsZTogc2hhZGVySGFuZGxlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAzNTYzMjpcbiAgICAgICAgICBvcHRzLmZzID0gbmV3IEZyYWdtZW50U2hhZGVyKHtcbiAgICAgICAgICAgIGhhbmRsZTogc2hhZGVySGFuZGxlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3B0cztcbiAgfVxuXG4gIF9nZXRQYXJhbWV0ZXIocG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuaGFuZGxlLCBwbmFtZSk7XG4gIH1cblxuICBfc2V0SWQoaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICBjb25zdCBwcm9ncmFtTmFtZSA9IHRoaXMuX2dldE5hbWUoKTtcblxuICAgICAgdGhpcy5pZCA9IHVpZChwcm9ncmFtTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgX2dldE5hbWUoKSB7XG4gICAgbGV0IHByb2dyYW1OYW1lID0gdGhpcy52cy5nZXROYW1lKCkgfHwgdGhpcy5mcy5nZXROYW1lKCk7XG4gICAgcHJvZ3JhbU5hbWUgPSBwcm9ncmFtTmFtZS5yZXBsYWNlKC9zaGFkZXIvaSwgJycpO1xuICAgIHByb2dyYW1OYW1lID0gcHJvZ3JhbU5hbWUgPyBgJHtwcm9ncmFtTmFtZX0tcHJvZ3JhbWAgOiAncHJvZ3JhbSc7XG4gICAgcmV0dXJuIHByb2dyYW1OYW1lO1xuICB9XG5cbiAgX2NvbXBpbGVBbmRMaW5rKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMuaGFuZGxlLCB0aGlzLnZzLmhhbmRsZSk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMuaGFuZGxlLCB0aGlzLmZzLmhhbmRsZSk7XG4gICAgbG9nLnRpbWUoTE9HX1BST0dSQU1fUEVSRl9QUklPUklUWSwgYGxpbmtQcm9ncmFtIGZvciAke3RoaXMuX2dldE5hbWUoKX1gKSgpO1xuICAgIGdsLmxpbmtQcm9ncmFtKHRoaXMuaGFuZGxlKTtcbiAgICBsb2cudGltZUVuZChMT0dfUFJPR1JBTV9QRVJGX1BSSU9SSVRZLCBgbGlua1Byb2dyYW0gZm9yICR7dGhpcy5fZ2V0TmFtZSgpfWApKCk7XG5cbiAgICBpZiAoZ2wuZGVidWcgfHwgbG9nLmxldmVsID4gMCkge1xuICAgICAgY29uc3QgbGlua2VkID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLmhhbmRsZSwgMzU3MTQpO1xuXG4gICAgICBpZiAoIWxpbmtlZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGxpbmtpbmc6ICR7Z2wuZ2V0UHJvZ3JhbUluZm9Mb2codGhpcy5oYW5kbGUpfWApO1xuICAgICAgfVxuXG4gICAgICBnbC52YWxpZGF0ZVByb2dyYW0odGhpcy5oYW5kbGUpO1xuICAgICAgY29uc3QgdmFsaWRhdGVkID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLmhhbmRsZSwgMzU3MTUpO1xuXG4gICAgICBpZiAoIXZhbGlkYXRlZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHZhbGlkYXRpbmc6ICR7Z2wuZ2V0UHJvZ3JhbUluZm9Mb2codGhpcy5oYW5kbGUpfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZWFkVW5pZm9ybUxvY2F0aW9uc0Zyb21MaW5rZWRQcm9ncmFtKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgdGhpcy5fdW5pZm9ybVNldHRlcnMgPSB7fTtcbiAgICB0aGlzLl91bmlmb3JtQ291bnQgPSB0aGlzLl9nZXRQYXJhbWV0ZXIoMzU3MTgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl91bmlmb3JtQ291bnQ7IGkrKykge1xuICAgICAgY29uc3QgaW5mbyA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybSh0aGlzLmhhbmRsZSwgaSk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIG5hbWVcbiAgICAgIH0gPSBwYXJzZVVuaWZvcm1OYW1lKGluZm8ubmFtZSk7XG4gICAgICBsZXQgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5oYW5kbGUsIG5hbWUpO1xuICAgICAgdGhpcy5fdW5pZm9ybVNldHRlcnNbbmFtZV0gPSBnZXRVbmlmb3JtU2V0dGVyKGdsLCBsb2NhdGlvbiwgaW5mbyk7XG5cbiAgICAgIGlmIChpbmZvLnNpemUgPiAxKSB7XG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgaW5mby5zaXplOyBsKyspIHtcbiAgICAgICAgICBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLmhhbmRsZSwgYCR7bmFtZX1bJHtsfV1gKTtcbiAgICAgICAgICB0aGlzLl91bmlmb3JtU2V0dGVyc1tgJHtuYW1lfVske2x9XWBdID0gZ2V0VW5pZm9ybVNldHRlcihnbCwgbG9jYXRpb24sIGluZm8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fdGV4dHVyZUluZGV4Q291bnRlciA9IDA7XG4gIH1cblxuICBnZXRBY3RpdmVVbmlmb3Jtcyh1bmlmb3JtSW5kaWNlcywgcG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nbDIuZ2V0QWN0aXZlVW5pZm9ybXModGhpcy5oYW5kbGUsIHVuaWZvcm1JbmRpY2VzLCBwbmFtZSk7XG4gIH1cblxuICBnZXRVbmlmb3JtQmxvY2tJbmRleChibG9ja05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nbDIuZ2V0VW5pZm9ybUJsb2NrSW5kZXgodGhpcy5oYW5kbGUsIGJsb2NrTmFtZSk7XG4gIH1cblxuICBnZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXIoYmxvY2tJbmRleCwgcG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nbDIuZ2V0QWN0aXZlVW5pZm9ybUJsb2NrUGFyYW1ldGVyKHRoaXMuaGFuZGxlLCBibG9ja0luZGV4LCBwbmFtZSk7XG4gIH1cblxuICB1bmlmb3JtQmxvY2tCaW5kaW5nKGJsb2NrSW5kZXgsIGJsb2NrQmluZGluZykge1xuICAgIHRoaXMuZ2wyLnVuaWZvcm1CbG9ja0JpbmRpbmcodGhpcy5oYW5kbGUsIGJsb2NrSW5kZXgsIGJsb2NrQmluZGluZyk7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvZ3JhbS5qcy5tYXAiLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgeyBGRUFUVVJFUywgaGFzRmVhdHVyZXMgfSBmcm9tICcuLi9mZWF0dXJlcyc7XG5pbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmNvbnN0IEdMX1FVRVJZX1JFU1VMVCA9IDB4ODg2NjtcbmNvbnN0IEdMX1FVRVJZX1JFU1VMVF9BVkFJTEFCTEUgPSAweDg4Njc7XG5jb25zdCBHTF9USU1FX0VMQVBTRURfRVhUID0gMHg4OGJmO1xuY29uc3QgR0xfR1BVX0RJU0pPSU5UX0VYVCA9IDB4OGZiYjtcbmNvbnN0IEdMX1RSQU5TRk9STV9GRUVEQkFDS19QUklNSVRJVkVTX1dSSVRURU4gPSAweDhjODg7XG5jb25zdCBHTF9BTllfU0FNUExFU19QQVNTRUQgPSAweDhjMmY7XG5jb25zdCBHTF9BTllfU0FNUExFU19QQVNTRURfQ09OU0VSVkFUSVZFID0gMHg4ZDZhO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVlcnkgZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIHN0YXRpYyBpc1N1cHBvcnRlZChnbCwgb3B0cyA9IFtdKSB7XG4gICAgY29uc3Qgd2ViZ2wyID0gaXNXZWJHTDIoZ2wpO1xuICAgIGNvbnN0IGhhc1RpbWVyUXVlcnkgPSBoYXNGZWF0dXJlcyhnbCwgRkVBVFVSRVMuVElNRVJfUVVFUlkpO1xuICAgIGxldCBzdXBwb3J0ZWQgPSB3ZWJnbDIgfHwgaGFzVGltZXJRdWVyeTtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIG9wdHMpIHtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3F1ZXJpZXMnOlxuICAgICAgICAgIHN1cHBvcnRlZCA9IHN1cHBvcnRlZCAmJiB3ZWJnbDI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZXJzJzpcbiAgICAgICAgICBzdXBwb3J0ZWQgPSBzdXBwb3J0ZWQgJiYgaGFzVGltZXJRdWVyeTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cHBvcnRlZDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBvcHRzID0ge30pIHtcbiAgICBzdXBlcihnbCwgb3B0cyk7XG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuX3F1ZXJ5UGVuZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX3BvbGxpbmdQcm9taXNlID0gbnVsbDtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGJlZ2luVGltZUVsYXBzZWRRdWVyeSgpIHtcbiAgICByZXR1cm4gdGhpcy5iZWdpbihHTF9USU1FX0VMQVBTRURfRVhUKTtcbiAgfVxuXG4gIGJlZ2luT2NjbHVzaW9uUXVlcnkoe1xuICAgIGNvbnNlcnZhdGl2ZSA9IGZhbHNlXG4gIH0gPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmJlZ2luKGNvbnNlcnZhdGl2ZSA/IEdMX0FOWV9TQU1QTEVTX1BBU1NFRF9DT05TRVJWQVRJVkUgOiBHTF9BTllfU0FNUExFU19QQVNTRUQpO1xuICB9XG5cbiAgYmVnaW5UcmFuc2Zvcm1GZWVkYmFja1F1ZXJ5KCkge1xuICAgIHJldHVybiB0aGlzLmJlZ2luKEdMX1RSQU5TRk9STV9GRUVEQkFDS19QUklNSVRJVkVTX1dSSVRURU4pO1xuICB9XG5cbiAgYmVnaW4odGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuX3F1ZXJ5UGVuZGluZykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5nbDIuYmVnaW5RdWVyeSh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW5kKCkge1xuICAgIGlmICh0aGlzLl9xdWVyeVBlbmRpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRhcmdldCkge1xuICAgICAgdGhpcy5nbDIuZW5kUXVlcnkodGhpcy50YXJnZXQpO1xuICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgICAgdGhpcy5fcXVlcnlQZW5kaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGlzUmVzdWx0QXZhaWxhYmxlKCkge1xuICAgIGlmICghdGhpcy5fcXVlcnlQZW5kaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0QXZhaWxhYmxlID0gdGhpcy5nbDIuZ2V0UXVlcnlQYXJhbWV0ZXIodGhpcy5oYW5kbGUsIEdMX1FVRVJZX1JFU1VMVF9BVkFJTEFCTEUpO1xuXG4gICAgaWYgKHJlc3VsdEF2YWlsYWJsZSkge1xuICAgICAgdGhpcy5fcXVlcnlQZW5kaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdEF2YWlsYWJsZTtcbiAgfVxuXG4gIGlzVGltZXJEaXNqb2ludCgpIHtcbiAgICByZXR1cm4gdGhpcy5nbDIuZ2V0UGFyYW1ldGVyKEdMX0dQVV9ESVNKT0lOVF9FWFQpO1xuICB9XG5cbiAgZ2V0UmVzdWx0KCkge1xuICAgIHJldHVybiB0aGlzLmdsMi5nZXRRdWVyeVBhcmFtZXRlcih0aGlzLmhhbmRsZSwgR0xfUVVFUllfUkVTVUxUKTtcbiAgfVxuXG4gIGdldFRpbWVyTWlsbGlzZWNvbmRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldFJlc3VsdCgpIC8gMWU2O1xuICB9XG5cbiAgY3JlYXRlUG9sbChsaW1pdCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgIGlmICh0aGlzLl9wb2xsaW5nUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BvbGxpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICB0aGlzLl9wb2xsaW5nUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBvbGwgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVzdWx0QXZhaWxhYmxlKCkpIHtcbiAgICAgICAgICByZXNvbHZlKHRoaXMuZ2V0UmVzdWx0KCkpO1xuICAgICAgICAgIHRoaXMuX3BvbGxpbmdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudGVyKysgPiBsaW1pdCkge1xuICAgICAgICAgIHJlamVjdCgnVGltZWQgb3V0Jyk7XG4gICAgICAgICAgdGhpcy5fcG9sbGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9wb2xsaW5nUHJvbWlzZTtcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIFF1ZXJ5LmlzU3VwcG9ydGVkKHRoaXMuZ2wpID8gdGhpcy5nbDIuY3JlYXRlUXVlcnkoKSA6IG51bGw7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wyLmRlbGV0ZVF1ZXJ5KHRoaXMuaGFuZGxlKTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1xdWVyeS5qcy5tYXAiLCJjb25zdCBFWFRfRkxPQVRfV0VCR0wyID0gJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBbMzMxODldOiB7XG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzE5MF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAzXG4gIH0sXG4gIFszNjAxMl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjE2OF06IHtcbiAgICBicHA6IDFcbiAgfSxcbiAgWzM0MDQxXToge1xuICAgIGJwcDogNFxuICB9LFxuICBbMzUwNTZdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzYwMTNdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNVxuICB9LFxuICBbMzI4NTRdOiB7XG4gICAgYnBwOiAyXG4gIH0sXG4gIFszNjE5NF06IHtcbiAgICBicHA6IDJcbiAgfSxcbiAgWzMyODU1XToge1xuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMjFdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMVxuICB9LFxuICBbMzMzMzBdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMVxuICB9LFxuICBbMzMzMjldOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMVxuICB9LFxuICBbMzMzMzJdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMzFdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMzRdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzMzMzNdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzMzMjNdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMzZdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMzVdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMlxuICB9LFxuICBbMzMzMzhdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzMzMzddOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzMzNDBdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogOFxuICB9LFxuICBbMzMzMzldOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogOFxuICB9LFxuICBbMzI4NDldOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogM1xuICB9LFxuICBbMzI4NTZdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzI4NTddOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzYyMjBdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzYyMzhdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzY5NzVdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogNFxuICB9LFxuICBbMzYyMTRdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogOFxuICB9LFxuICBbMzYyMzJdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogOFxuICB9LFxuICBbMzYyMjZdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMTZcbiAgfSxcbiAgWzM2MjA4XToge1xuICAgIGdsMjogdHJ1ZSxcbiAgICBicHA6IDE2XG4gIH0sXG4gIFszMzMyNV06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMyN106IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNDg0Ml06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszMzMyNl06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMzMyOF06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszNDgzNl06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiAxNlxuICB9LFxuICBbMzU4OThdOiB7XG4gICAgZ2wyOiBFWFRfRkxPQVRfV0VCR0wyLFxuICAgIGJwcDogNFxuICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyYnVmZmVyLWZvcm1hdHMuanMubWFwIiwiaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuaW1wb3J0IFJFTkRFUkJVRkZFUl9GT1JNQVRTIGZyb20gJy4vcmVuZGVyYnVmZmVyLWZvcm1hdHMnO1xuaW1wb3J0IHsgaXNXZWJHTDIgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5cbmZ1bmN0aW9uIGlzRm9ybWF0U3VwcG9ydGVkKGdsLCBmb3JtYXQsIGZvcm1hdHMpIHtcbiAgY29uc3QgaW5mbyA9IGZvcm1hdHNbZm9ybWF0XTtcblxuICBpZiAoIWluZm8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWx1ZSA9IGlzV2ViR0wyKGdsKSA/IGluZm8uZ2wyIHx8IGluZm8uZ2wxIDogaW5mby5nbDE7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZ2wuZ2V0RXh0ZW5zaW9uKHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyYnVmZmVyIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wsIHtcbiAgICBmb3JtYXRcbiAgfSA9IHtcbiAgICBmb3JtYXQ6IG51bGxcbiAgfSkge1xuICAgIHJldHVybiAhZm9ybWF0IHx8IGlzRm9ybWF0U3VwcG9ydGVkKGdsLCBmb3JtYXQsIFJFTkRFUkJVRkZFUl9GT1JNQVRTKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTYW1wbGVzRm9yRm9ybWF0KGdsLCB7XG4gICAgZm9ybWF0XG4gIH0pIHtcbiAgICByZXR1cm4gZ2wuZ2V0SW50ZXJuYWxmb3JtYXRQYXJhbWV0ZXIoMzYxNjEsIGZvcm1hdCwgMzI5MzcpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKGdsLCBvcHRzKTtcbiAgICB0aGlzLmluaXRpYWxpemUob3B0cyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBpbml0aWFsaXplKHtcbiAgICBmb3JtYXQsXG4gICAgd2lkdGggPSAxLFxuICAgIGhlaWdodCA9IDEsXG4gICAgc2FtcGxlcyA9IDBcbiAgfSkge1xuICAgIGFzc2VydChmb3JtYXQsICdOZWVkcyBmb3JtYXQnKTtcblxuICAgIHRoaXMuX3RyYWNrRGVhbGxvY2F0ZWRNZW1vcnkoKTtcblxuICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcigzNjE2MSwgdGhpcy5oYW5kbGUpO1xuXG4gICAgaWYgKHNhbXBsZXMgIT09IDAgJiYgaXNXZWJHTDIodGhpcy5nbCkpIHtcbiAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlKDM2MTYxLCBzYW1wbGVzLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoMzYxNjEsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuc2FtcGxlcyA9IHNhbXBsZXM7XG5cbiAgICB0aGlzLl90cmFja0FsbG9jYXRlZE1lbW9yeSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiAodGhpcy5zYW1wbGVzIHx8IDEpICogUkVOREVSQlVGRkVSX0ZPUk1BVFNbdGhpcy5mb3JtYXRdLmJwcCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlc2l6ZSh7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pIHtcbiAgICBpZiAod2lkdGggIT09IHRoaXMud2lkdGggfHwgaGVpZ2h0ICE9PSB0aGlzLmhlaWdodCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZSh7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIGZvcm1hdDogdGhpcy5mb3JtYXQsXG4gICAgICAgIHNhbXBsZXM6IHRoaXMuc2FtcGxlc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aGlzLmdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcih0aGlzLmhhbmRsZSk7XG5cbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCk7XG4gIH1cblxuICBfYmluZEhhbmRsZShoYW5kbGUpIHtcbiAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIoMzYxNjEsIGhhbmRsZSk7XG4gIH1cblxuICBfc3luY0hhbmRsZShoYW5kbGUpIHtcbiAgICB0aGlzLmZvcm1hdCA9IHRoaXMuZ2V0UGFyYW1ldGVyKDM2MTY0KTtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5nZXRQYXJhbWV0ZXIoMzYxNjIpO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5nZXRQYXJhbWV0ZXIoMzYxNjMpO1xuICAgIHRoaXMuc2FtcGxlcyA9IHRoaXMuZ2V0UGFyYW1ldGVyKDM2MDExKTtcbiAgfVxuXG4gIF9nZXRQYXJhbWV0ZXIocG5hbWUpIHtcbiAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIoMzYxNjEsIHRoaXMuaGFuZGxlKTtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2wuZ2V0UmVuZGVyYnVmZmVyUGFyYW1ldGVyKDM2MTYxLCBwbmFtZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlcmJ1ZmZlci5qcy5tYXAiLCJpbXBvcnQgeyBpc1dlYkdMMiwgYXNzZXJ0V2ViR0xDb250ZXh0IH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBsdW1hU3RhdHMgfSBmcm9tICcuLi9pbml0JztcbmltcG9ydCB7IGdldEtleSwgZ2V0S2V5VmFsdWUgfSBmcm9tICcuLi93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgdWlkIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsgc3R1YlJlbW92ZWRNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvc3R1Yi1tZXRob2RzJztcbmNvbnN0IEVSUl9SRVNPVVJDRV9NRVRIT0RfVU5ERUZJTkVEID0gJ1Jlc291cmNlIHN1YmNsYXNzIG11c3QgZGVmaW5lIHZpcnR1YWwgbWV0aG9kcyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGdsLCBvcHRzID0ge30pIHtcbiAgICBhc3NlcnRXZWJHTENvbnRleHQoZ2wpO1xuICAgIGNvbnN0IHtcbiAgICAgIGlkLFxuICAgICAgdXNlckRhdGEgPSB7fVxuICAgIH0gPSBvcHRzO1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLmdsMiA9IGdsO1xuICAgIHRoaXMuaWQgPSBpZCB8fCB1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKTtcbiAgICB0aGlzLnVzZXJEYXRhID0gdXNlckRhdGE7XG4gICAgdGhpcy5fYm91bmQgPSBmYWxzZTtcbiAgICB0aGlzLl9oYW5kbGUgPSBvcHRzLmhhbmRsZTtcblxuICAgIGlmICh0aGlzLl9oYW5kbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faGFuZGxlID0gdGhpcy5fY3JlYXRlSGFuZGxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5ieXRlTGVuZ3RoID0gMDtcblxuICAgIHRoaXMuX2FkZFN0YXRzKCk7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSgke3RoaXMuaWR9KWA7XG4gIH1cblxuICBnZXQgaGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLl9oYW5kbGU7XG4gIH1cblxuICBkZWxldGUoe1xuICAgIGRlbGV0ZUNoaWxkcmVuID0gZmFsc2VcbiAgfSA9IHt9KSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9oYW5kbGUgJiYgdGhpcy5fZGVsZXRlSGFuZGxlKHRoaXMuX2hhbmRsZSk7XG5cbiAgICBpZiAodGhpcy5faGFuZGxlKSB7XG4gICAgICB0aGlzLl9yZW1vdmVTdGF0cygpO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZSA9IG51bGw7XG5cbiAgICBpZiAoY2hpbGRyZW4gJiYgZGVsZXRlQ2hpbGRyZW4pIHtcbiAgICAgIGNoaWxkcmVuLmZpbHRlcihCb29sZWFuKS5mb3JFYWNoKGNoaWxkID0+IGNoaWxkLmRlbGV0ZSgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGJpbmQoZnVuY09ySGFuZGxlID0gdGhpcy5oYW5kbGUpIHtcbiAgICBpZiAodHlwZW9mIGZ1bmNPckhhbmRsZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fYmluZEhhbmRsZShmdW5jT3JIYW5kbGUpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU7XG5cbiAgICBpZiAoIXRoaXMuX2JvdW5kKSB7XG4gICAgICB0aGlzLl9iaW5kSGFuZGxlKHRoaXMuaGFuZGxlKTtcblxuICAgICAgdGhpcy5fYm91bmQgPSB0cnVlO1xuICAgICAgdmFsdWUgPSBmdW5jT3JIYW5kbGUoKTtcbiAgICAgIHRoaXMuX2JvdW5kID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuX2JpbmRIYW5kbGUobnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gZnVuY09ySGFuZGxlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgdW5iaW5kKCkge1xuICAgIHRoaXMuYmluZChudWxsKTtcbiAgfVxuXG4gIGdldFBhcmFtZXRlcihwbmFtZSwgb3B0cyA9IHt9KSB7XG4gICAgcG5hbWUgPSBnZXRLZXlWYWx1ZSh0aGlzLmdsLCBwbmFtZSk7XG4gICAgYXNzZXJ0KHBuYW1lKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gdGhpcy5jb25zdHJ1Y3Rvci5QQVJBTUVURVJTIHx8IHt9O1xuICAgIGNvbnN0IHBhcmFtZXRlciA9IHBhcmFtZXRlcnNbcG5hbWVdO1xuXG4gICAgaWYgKHBhcmFtZXRlcikge1xuICAgICAgY29uc3QgaXNXZWJnbDIgPSBpc1dlYkdMMih0aGlzLmdsKTtcbiAgICAgIGNvbnN0IHBhcmFtZXRlckF2YWlsYWJsZSA9ICghKCd3ZWJnbDInIGluIHBhcmFtZXRlcikgfHwgaXNXZWJnbDIpICYmICghKCdleHRlbnNpb24nIGluIHBhcmFtZXRlcikgfHwgdGhpcy5nbC5nZXRFeHRlbnNpb24ocGFyYW1ldGVyLmV4dGVuc2lvbikpO1xuXG4gICAgICBpZiAoIXBhcmFtZXRlckF2YWlsYWJsZSkge1xuICAgICAgICBjb25zdCB3ZWJnbDFEZWZhdWx0ID0gcGFyYW1ldGVyLndlYmdsMTtcbiAgICAgICAgY29uc3Qgd2ViZ2wyRGVmYXVsdCA9ICd3ZWJnbDInIGluIHBhcmFtZXRlciA/IHBhcmFtZXRlci53ZWJnbDIgOiBwYXJhbWV0ZXIud2ViZ2wxO1xuICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBpc1dlYmdsMiA/IHdlYmdsMkRlZmF1bHQgOiB3ZWJnbDFEZWZhdWx0O1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9nZXRQYXJhbWV0ZXIocG5hbWUsIG9wdHMpO1xuICB9XG5cbiAgZ2V0UGFyYW1ldGVycyhvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBwYXJhbWV0ZXJzLFxuICAgICAga2V5c1xuICAgIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IFBBUkFNRVRFUlMgPSB0aGlzLmNvbnN0cnVjdG9yLlBBUkFNRVRFUlMgfHwge307XG4gICAgY29uc3QgaXNXZWJnbDIgPSBpc1dlYkdMMih0aGlzLmdsKTtcbiAgICBjb25zdCB2YWx1ZXMgPSB7fTtcbiAgICBjb25zdCBwYXJhbWV0ZXJLZXlzID0gcGFyYW1ldGVycyB8fCBPYmplY3Qua2V5cyhQQVJBTUVURVJTKTtcblxuICAgIGZvciAoY29uc3QgcG5hbWUgb2YgcGFyYW1ldGVyS2V5cykge1xuICAgICAgY29uc3QgcGFyYW1ldGVyID0gUEFSQU1FVEVSU1twbmFtZV07XG4gICAgICBjb25zdCBwYXJhbWV0ZXJBdmFpbGFibGUgPSBwYXJhbWV0ZXIgJiYgKCEoJ3dlYmdsMicgaW4gcGFyYW1ldGVyKSB8fCBpc1dlYmdsMikgJiYgKCEoJ2V4dGVuc2lvbicgaW4gcGFyYW1ldGVyKSB8fCB0aGlzLmdsLmdldEV4dGVuc2lvbihwYXJhbWV0ZXIuZXh0ZW5zaW9uKSk7XG5cbiAgICAgIGlmIChwYXJhbWV0ZXJBdmFpbGFibGUpIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5cyA/IGdldEtleSh0aGlzLmdsLCBwbmFtZSkgOiBwbmFtZTtcbiAgICAgICAgdmFsdWVzW2tleV0gPSB0aGlzLmdldFBhcmFtZXRlcihwbmFtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKGtleXMgJiYgcGFyYW1ldGVyLnR5cGUgPT09ICdHTGVudW0nKSB7XG4gICAgICAgICAgdmFsdWVzW2tleV0gPSBnZXRLZXkodGhpcy5nbCwgdmFsdWVzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIHNldFBhcmFtZXRlcihwbmFtZSwgdmFsdWUpIHtcbiAgICBwbmFtZSA9IGdldEtleVZhbHVlKHRoaXMuZ2wsIHBuYW1lKTtcbiAgICBhc3NlcnQocG5hbWUpO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLmNvbnN0cnVjdG9yLlBBUkFNRVRFUlMgfHwge307XG4gICAgY29uc3QgcGFyYW1ldGVyID0gcGFyYW1ldGVyc1twbmFtZV07XG5cbiAgICBpZiAocGFyYW1ldGVyKSB7XG4gICAgICBjb25zdCBpc1dlYmdsMiA9IGlzV2ViR0wyKHRoaXMuZ2wpO1xuICAgICAgY29uc3QgcGFyYW1ldGVyQXZhaWxhYmxlID0gKCEoJ3dlYmdsMicgaW4gcGFyYW1ldGVyKSB8fCBpc1dlYmdsMikgJiYgKCEoJ2V4dGVuc2lvbicgaW4gcGFyYW1ldGVyKSB8fCB0aGlzLmdsLmdldEV4dGVuc2lvbihwYXJhbWV0ZXIuZXh0ZW5zaW9uKSk7XG5cbiAgICAgIGlmICghcGFyYW1ldGVyQXZhaWxhYmxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyYW1ldGVyIG5vdCBhdmFpbGFibGUgb24gdGhpcyBwbGF0Zm9ybScpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1ldGVyLnR5cGUgPT09ICdHTGVudW0nKSB7XG4gICAgICAgIHZhbHVlID0gZ2V0S2V5VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3NldFBhcmFtZXRlcihwbmFtZSwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQYXJhbWV0ZXJzKHBhcmFtZXRlcnMpIHtcbiAgICBmb3IgKGNvbnN0IHBuYW1lIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgIHRoaXMuc2V0UGFyYW1ldGVyKHBuYW1lLCBwYXJhbWV0ZXJzW3BuYW1lXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdHViUmVtb3ZlZE1ldGhvZHMoY2xhc3NOYW1lLCB2ZXJzaW9uLCBtZXRob2ROYW1lcykge1xuICAgIHJldHVybiBzdHViUmVtb3ZlZE1ldGhvZHModGhpcywgY2xhc3NOYW1lLCB2ZXJzaW9uLCBtZXRob2ROYW1lcyk7XG4gIH1cblxuICBpbml0aWFsaXplKG9wdHMpIHt9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoRVJSX1JFU09VUkNFX01FVEhPRF9VTkRFRklORUQpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoRVJSX1JFU09VUkNFX01FVEhPRF9VTkRFRklORUQpO1xuICB9XG5cbiAgX2JpbmRIYW5kbGUoaGFuZGxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEVSUl9SRVNPVVJDRV9NRVRIT0RfVU5ERUZJTkVEKTtcbiAgfVxuXG4gIF9nZXRPcHRzRnJvbUhhbmRsZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoRVJSX1JFU09VUkNFX01FVEhPRF9VTkRFRklORUQpO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSwgb3B0cykge1xuICAgIHRocm93IG5ldyBFcnJvcihFUlJfUkVTT1VSQ0VfTUVUSE9EX1VOREVGSU5FRCk7XG4gIH1cblxuICBfc2V0UGFyYW1ldGVyKHBuYW1lLCB2YWx1ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihFUlJfUkVTT1VSQ0VfTUVUSE9EX1VOREVGSU5FRCk7XG4gIH1cblxuICBfY29udGV4dCgpIHtcbiAgICB0aGlzLmdsLmx1bWEgPSB0aGlzLmdsLmx1bWEgfHwge307XG4gICAgcmV0dXJuIHRoaXMuZ2wubHVtYTtcbiAgfVxuXG4gIF9hZGRTdGF0cygpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIGNvbnN0IHN0YXRzID0gbHVtYVN0YXRzLmdldCgnUmVzb3VyY2UgQ291bnRzJyk7XG4gICAgc3RhdHMuZ2V0KCdSZXNvdXJjZXMgQ3JlYXRlZCcpLmluY3JlbWVudENvdW50KCk7XG4gICAgc3RhdHMuZ2V0KGAke25hbWV9cyBDcmVhdGVkYCkuaW5jcmVtZW50Q291bnQoKTtcbiAgICBzdGF0cy5nZXQoYCR7bmFtZX1zIEFjdGl2ZWApLmluY3JlbWVudENvdW50KCk7XG4gIH1cblxuICBfcmVtb3ZlU3RhdHMoKSB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICBjb25zdCBzdGF0cyA9IGx1bWFTdGF0cy5nZXQoJ1Jlc291cmNlIENvdW50cycpO1xuICAgIHN0YXRzLmdldChgJHtuYW1lfXMgQWN0aXZlYCkuZGVjcmVtZW50Q291bnQoKTtcbiAgfVxuXG4gIF90cmFja0FsbG9jYXRlZE1lbW9yeShieXRlcywgbmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZSkge1xuICAgIGNvbnN0IHN0YXRzID0gbHVtYVN0YXRzLmdldCgnTWVtb3J5IFVzYWdlJyk7XG4gICAgc3RhdHMuZ2V0KCdHUFUgTWVtb3J5JykuYWRkQ291bnQoYnl0ZXMpO1xuICAgIHN0YXRzLmdldChgJHtuYW1lfSBNZW1vcnlgKS5hZGRDb3VudChieXRlcyk7XG4gICAgdGhpcy5ieXRlTGVuZ3RoID0gYnl0ZXM7XG4gIH1cblxuICBfdHJhY2tEZWFsbG9jYXRlZE1lbW9yeShuYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBsdW1hU3RhdHMuZ2V0KCdNZW1vcnkgVXNhZ2UnKTtcbiAgICBzdGF0cy5nZXQoJ0dQVSBNZW1vcnknKS5zdWJ0cmFjdENvdW50KHRoaXMuYnl0ZUxlbmd0aCk7XG4gICAgc3RhdHMuZ2V0KGAke25hbWV9IE1lbW9yeWApLnN1YnRyYWN0Q291bnQodGhpcy5ieXRlTGVuZ3RoKTtcbiAgICB0aGlzLmJ5dGVMZW5ndGggPSAwO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc291cmNlLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydFdlYkdMQ29udGV4dCwgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBwYXJzZUdMU0xDb21waWxlckVycm9yLCBnZXRTaGFkZXJOYW1lIH0gZnJvbSAnLi4vZ2xzbC11dGlscyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgdWlkIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuY29uc3QgRVJSX1NPVVJDRSA9ICdTaGFkZXI6IEdMU0wgc291cmNlIGNvZGUgbXVzdCBiZSBhIEphdmFTY3JpcHQgc3RyaW5nJztcbmV4cG9ydCBjbGFzcyBTaGFkZXIgZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIHN0YXRpYyBnZXRUeXBlTmFtZShzaGFkZXJUeXBlKSB7XG4gICAgc3dpdGNoIChzaGFkZXJUeXBlKSB7XG4gICAgICBjYXNlIDM1NjMzOlxuICAgICAgICByZXR1cm4gJ3ZlcnRleC1zaGFkZXInO1xuXG4gICAgICBjYXNlIDM1NjMyOlxuICAgICAgICByZXR1cm4gJ2ZyYWdtZW50LXNoYWRlcic7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzKSB7XG4gICAgYXNzZXJ0V2ViR0xDb250ZXh0KGdsKTtcbiAgICBhc3NlcnQodHlwZW9mIHByb3BzLnNvdXJjZSA9PT0gJ3N0cmluZycsIEVSUl9TT1VSQ0UpO1xuICAgIGNvbnN0IGlkID0gZ2V0U2hhZGVyTmFtZShwcm9wcy5zb3VyY2UsIG51bGwpIHx8IHByb3BzLmlkIHx8IHVpZChgdW5uYW1lZCAke1NoYWRlci5nZXRUeXBlTmFtZShwcm9wcy5zaGFkZXJUeXBlKX1gKTtcbiAgICBzdXBlcihnbCwge1xuICAgICAgaWRcbiAgICB9KTtcbiAgICB0aGlzLnNoYWRlclR5cGUgPSBwcm9wcy5zaGFkZXJUeXBlO1xuICAgIHRoaXMuc291cmNlID0gcHJvcHMuc291cmNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gIH1cblxuICBpbml0aWFsaXplKHtcbiAgICBzb3VyY2VcbiAgfSkge1xuICAgIGNvbnN0IHNoYWRlck5hbWUgPSBnZXRTaGFkZXJOYW1lKHNvdXJjZSwgbnVsbCk7XG5cbiAgICBpZiAoc2hhZGVyTmFtZSkge1xuICAgICAgdGhpcy5pZCA9IHVpZChzaGFkZXJOYW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb21waWxlKHNvdXJjZSk7XG4gIH1cblxuICBnZXRQYXJhbWV0ZXIocG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5nZXRTaGFkZXJQYXJhbWV0ZXIodGhpcy5oYW5kbGUsIHBuYW1lKTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHtTaGFkZXIuZ2V0VHlwZU5hbWUodGhpcy5zaGFkZXJUeXBlKX06JHt0aGlzLmlkfWA7XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiBnZXRTaGFkZXJOYW1lKHRoaXMuc291cmNlKSB8fCAndW5uYW1lZC1zaGFkZXInO1xuICB9XG5cbiAgZ2V0U291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmdldFNoYWRlclNvdXJjZSh0aGlzLmhhbmRsZSk7XG4gIH1cblxuICBnZXRUcmFuc2xhdGVkU291cmNlKCkge1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZWJ1Z19zaGFkZXJzJyk7XG4gICAgcmV0dXJuIGV4dGVuc2lvbiA/IGV4dGVuc2lvbi5nZXRUcmFuc2xhdGVkU2hhZGVyU291cmNlKHRoaXMuaGFuZGxlKSA6ICdObyB0cmFuc2xhdGVkIHNvdXJjZSBhdmFpbGFibGUuIFdFQkdMX2RlYnVnX3NoYWRlcnMgbm90IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIF9jb21waWxlKHNvdXJjZSA9IHRoaXMuc291cmNlKSB7XG4gICAgaWYgKCFzb3VyY2Uuc3RhcnRzV2l0aCgnI3ZlcnNpb24gJykpIHtcbiAgICAgIHNvdXJjZSA9IGAjdmVyc2lvbiAxMDBcXG4ke3NvdXJjZX1gO1xuICAgIH1cblxuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgIHRoaXMuZ2wuc2hhZGVyU291cmNlKHRoaXMuaGFuZGxlLCB0aGlzLnNvdXJjZSk7XG4gICAgdGhpcy5nbC5jb21waWxlU2hhZGVyKHRoaXMuaGFuZGxlKTtcbiAgICBjb25zdCBjb21waWxlU3RhdHVzID0gdGhpcy5nZXRQYXJhbWV0ZXIoMzU3MTMpO1xuXG4gICAgaWYgKCFjb21waWxlU3RhdHVzKSB7XG4gICAgICBjb25zdCBpbmZvTG9nID0gdGhpcy5nbC5nZXRTaGFkZXJJbmZvTG9nKHRoaXMuaGFuZGxlKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2hhZGVyTmFtZSxcbiAgICAgICAgZXJyb3JzLFxuICAgICAgICB3YXJuaW5nc1xuICAgICAgfSA9IHBhcnNlR0xTTENvbXBpbGVyRXJyb3IoaW5mb0xvZywgdGhpcy5zb3VyY2UsIHRoaXMuc2hhZGVyVHlwZSwgdGhpcy5pZCk7XG4gICAgICBsb2cuZXJyb3IoYEdMU0wgY29tcGlsYXRpb24gZXJyb3JzIGluICR7c2hhZGVyTmFtZX1cXG4ke2Vycm9yc31gKSgpO1xuICAgICAgbG9nLndhcm4oYEdMU0wgY29tcGlsYXRpb24gd2FybmluZ3MgaW4gJHtzaGFkZXJOYW1lfVxcbiR7d2FybmluZ3N9YCkoKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgR0xTTCBjb21waWxhdGlvbiBlcnJvcnMgaW4gJHtzaGFkZXJOYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIF9kZWxldGVIYW5kbGUoKSB7XG4gICAgdGhpcy5nbC5kZWxldGVTaGFkZXIodGhpcy5oYW5kbGUpO1xuICB9XG5cbiAgX2dldE9wdHNGcm9tSGFuZGxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0aGlzLmdldFBhcmFtZXRlcigzNTY2MyksXG4gICAgICBzb3VyY2U6IHRoaXMuZ2V0U291cmNlKClcbiAgICB9O1xuICB9XG5cbn1cbmV4cG9ydCBjbGFzcyBWZXJ0ZXhTaGFkZXIgZXh0ZW5kcyBTaGFkZXIge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMpIHtcbiAgICBpZiAodHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgcHJvcHMgPSB7XG4gICAgICAgIHNvdXJjZTogcHJvcHNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3VwZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICBzaGFkZXJUeXBlOiAzNTYzM1xuICAgIH0pKTtcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY3JlYXRlU2hhZGVyKDM1NjMzKTtcbiAgfVxuXG59XG5leHBvcnQgY2xhc3MgRnJhZ21lbnRTaGFkZXIgZXh0ZW5kcyBTaGFkZXIge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMpIHtcbiAgICBpZiAodHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgcHJvcHMgPSB7XG4gICAgICAgIHNvdXJjZTogcHJvcHNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3VwZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICBzaGFkZXJUeXBlOiAzNTYzMlxuICAgIH0pKTtcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY3JlYXRlU2hhZGVyKDM1NjMyKTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGFkZXIuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0V2ViR0xDb250ZXh0IH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuaW1wb3J0IHsgbG9hZEltYWdlIH0gZnJvbSAnLi4vdXRpbHMvbG9hZC1maWxlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHR1cmUyRCBleHRlbmRzIFRleHR1cmUge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wsIG9wdHMpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5pc1N1cHBvcnRlZChnbCwgb3B0cyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMgPSB7fSkge1xuICAgIGFzc2VydFdlYkdMQ29udGV4dChnbCk7XG5cbiAgICBpZiAocHJvcHMgaW5zdGFuY2VvZiBQcm9taXNlIHx8IHR5cGVvZiBwcm9wcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHByb3BzID0ge1xuICAgICAgICBkYXRhOiBwcm9wc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByb3BzLmRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgIGRhdGE6IGxvYWRJbWFnZShwcm9wcy5kYXRhKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3VwZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICB0YXJnZXQ6IDM1NTNcbiAgICB9KSk7XG4gICAgdGhpcy5pbml0aWFsaXplKHByb3BzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLTJkLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyLCBhc3NlcnRXZWJHTDJDb250ZXh0LCB3aXRoUGFyYW1ldGVycyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi90ZXh0dXJlJztcbmltcG9ydCB7IERBVEFfRk9STUFUX0NIQU5ORUxTLCBUWVBFX1NJWkVTIH0gZnJvbSAnLi90ZXh0dXJlLWZvcm1hdHMnO1xuaW1wb3J0IEJ1ZmZlciBmcm9tICcuL2J1ZmZlcic7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dXJlM0QgZXh0ZW5kcyBUZXh0dXJlIHtcbiAgc3RhdGljIGlzU3VwcG9ydGVkKGdsKSB7XG4gICAgcmV0dXJuIGlzV2ViR0wyKGdsKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcyA9IHt9KSB7XG4gICAgYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGRlcHRoOiAxXG4gICAgfSwgcHJvcHMsIHtcbiAgICAgIHRhcmdldDogMzI4NzksXG4gICAgICB1bnBhY2tGbGlwWTogZmFsc2VcbiAgICB9KTtcbiAgICBzdXBlcihnbCwgcHJvcHMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBzZXRJbWFnZURhdGEoe1xuICAgIGxldmVsID0gMCxcbiAgICBkYXRhRm9ybWF0ID0gNjQwOCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZGVwdGggPSAxLFxuICAgIGJvcmRlciA9IDAsXG4gICAgZm9ybWF0LFxuICAgIHR5cGUgPSA1MTIxLFxuICAgIG9mZnNldCA9IDAsXG4gICAgZGF0YSxcbiAgICBwYXJhbWV0ZXJzID0ge31cbiAgfSkge1xuICAgIHRoaXMuX3RyYWNrRGVhbGxvY2F0ZWRNZW1vcnkoJ1RleHR1cmUnKTtcblxuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB3aXRoUGFyYW1ldGVycyh0aGlzLmdsLCBwYXJhbWV0ZXJzLCAoKSA9PiB7XG4gICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7XG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UzRCh0aGlzLnRhcmdldCwgbGV2ZWwsIGRhdGFGb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGRlcHRoLCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcigzNTA1MiwgZGF0YS5oYW5kbGUpO1xuICAgICAgICB0aGlzLmdsLnRleEltYWdlM0QodGhpcy50YXJnZXQsIGxldmVsLCBkYXRhRm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBkZXB0aCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIG9mZnNldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YSAmJiBkYXRhLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRoaXMuX3RyYWNrQWxsb2NhdGVkTWVtb3J5KGRhdGEuYnl0ZUxlbmd0aCwgJ1RleHR1cmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2hhbm5lbHMgPSBEQVRBX0ZPUk1BVF9DSEFOTkVMU1t0aGlzLmRhdGFGb3JtYXRdIHx8IDQ7XG4gICAgICBjb25zdCBjaGFubmVsU2l6ZSA9IFRZUEVfU0laRVNbdGhpcy50eXBlXSB8fCAxO1xuXG4gICAgICB0aGlzLl90cmFja0FsbG9jYXRlZE1lbW9yeSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiB0aGlzLmRlcHRoICogY2hhbm5lbHMgKiBjaGFubmVsU2l6ZSwgJ1RleHR1cmUnKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGV4dHVyZS0zZC5qcy5tYXAiLCJpbXBvcnQgeyBsb2csIGFzc2VydFdlYkdMQ29udGV4dCB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi90ZXh0dXJlJztcbmNvbnN0IEZBQ0VTID0gWzM0MDY5LCAzNDA3MCwgMzQwNzEsIDM0MDcyLCAzNDA3MywgMzQwNzRdO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dHVyZUN1YmUgZXh0ZW5kcyBUZXh0dXJlIHtcbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzID0ge30pIHtcbiAgICBhc3NlcnRXZWJHTENvbnRleHQoZ2wpO1xuICAgIHN1cGVyKGdsLCBPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgdGFyZ2V0OiAzNDA2N1xuICAgIH0pKTtcbiAgICB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShwcm9wcyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgbWlwbWFwcyA9IHRydWUsXG4gICAgICBwYXJhbWV0ZXJzID0ge31cbiAgICB9ID0gcHJvcHM7XG4gICAgdGhpcy5vcHRzID0gcHJvcHM7XG4gICAgdGhpcy5zZXRDdWJlTWFwSW1hZ2VEYXRhKHByb3BzKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcblxuICAgICAgaWYgKG1pcG1hcHMpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcChwcm9wcyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UGFyYW1ldGVycyhwYXJhbWV0ZXJzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN1YkltYWdlKHtcbiAgICBmYWNlLFxuICAgIGRhdGEsXG4gICAgeCA9IDAsXG4gICAgeSA9IDAsXG4gICAgbWlwbWFwTGV2ZWwgPSAwXG4gIH0pIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViSW1hZ2Uoe1xuICAgICAgdGFyZ2V0OiBmYWNlLFxuICAgICAgZGF0YSxcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgbWlwbWFwTGV2ZWxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHNldEN1YmVNYXBJbWFnZURhdGEoe1xuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBwaXhlbHMsXG4gICAgZGF0YSxcbiAgICBib3JkZXIgPSAwLFxuICAgIGZvcm1hdCA9IDY0MDgsXG4gICAgdHlwZSA9IDUxMjFcbiAgfSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgaW1hZ2VEYXRhTWFwID0gcGl4ZWxzIHx8IGRhdGE7XG4gICAgY29uc3QgcmVzb2x2ZWRGYWNlcyA9IGF3YWl0IFByb21pc2UuYWxsKEZBQ0VTLm1hcChmYWNlID0+IHtcbiAgICAgIGNvbnN0IGZhY2VQaXhlbHMgPSBpbWFnZURhdGFNYXBbZmFjZV07XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoQXJyYXkuaXNBcnJheShmYWNlUGl4ZWxzKSA/IGZhY2VQaXhlbHMgOiBbZmFjZVBpeGVsc10pO1xuICAgIH0pKTtcbiAgICB0aGlzLmJpbmQoKTtcbiAgICBGQUNFUy5mb3JFYWNoKChmYWNlLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKHJlc29sdmVkRmFjZXNbaW5kZXhdLmxlbmd0aCA+IDEgJiYgdGhpcy5vcHRzLm1pcG1hcHMgIT09IGZhbHNlKSB7XG4gICAgICAgIGxvZy53YXJuKGAke3RoaXMuaWR9IGhhcyBtaXBtYXAgYW5kIG11bHRpcGxlIExPRHMuYCkoKTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZWRGYWNlc1tpbmRleF0uZm9yRWFjaCgoaW1hZ2UsIGxvZExldmVsKSA9PiB7XG4gICAgICAgIGlmICh3aWR0aCAmJiBoZWlnaHQpIHtcbiAgICAgICAgICBnbC50ZXhJbWFnZTJEKGZhY2UsIGxvZExldmVsLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBpbWFnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2wudGV4SW1hZ2UyRChmYWNlLCBsb2RMZXZlbCwgZm9ybWF0LCBmb3JtYXQsIHR5cGUsIGltYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy51bmJpbmQoKTtcbiAgfVxuXG4gIHNldEltYWdlRGF0YUZvckZhY2Uob3B0aW9ucykge1xuICAgIGNvbnN0IHtcbiAgICAgIGZhY2UsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBpeGVscyxcbiAgICAgIGRhdGEsXG4gICAgICBib3JkZXIgPSAwLFxuICAgICAgZm9ybWF0ID0gNjQwOCxcbiAgICAgIHR5cGUgPSA1MTIxXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBpbWFnZURhdGEgPSBwaXhlbHMgfHwgZGF0YTtcbiAgICB0aGlzLmJpbmQoKTtcblxuICAgIGlmIChpbWFnZURhdGEgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICBpbWFnZURhdGEudGhlbihyZXNvbHZlZEltYWdlRGF0YSA9PiB0aGlzLnNldEltYWdlRGF0YUZvckZhY2UoT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuICAgICAgICBmYWNlLFxuICAgICAgICBkYXRhOiByZXNvbHZlZEltYWdlRGF0YSxcbiAgICAgICAgcGl4ZWxzOiByZXNvbHZlZEltYWdlRGF0YVxuICAgICAgfSkpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMud2lkdGggfHwgdGhpcy5oZWlnaHQpIHtcbiAgICAgIGdsLnRleEltYWdlMkQoZmFjZSwgMCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgaW1hZ2VEYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wudGV4SW1hZ2UyRChmYWNlLCAwLCBmb3JtYXQsIGZvcm1hdCwgdHlwZSwgaW1hZ2VEYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59XG5UZXh0dXJlQ3ViZS5GQUNFUyA9IEZBQ0VTO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGV4dHVyZS1jdWJlLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5leHBvcnQgY29uc3QgVEVYVFVSRV9GT1JNQVRTID0ge1xuICBbNjQwN106IHtcbiAgICBkYXRhRm9ybWF0OiA2NDA3LFxuICAgIHR5cGVzOiBbNTEyMSwgMzM2MzVdXG4gIH0sXG4gIFs2NDA4XToge1xuICAgIGRhdGFGb3JtYXQ6IDY0MDgsXG4gICAgdHlwZXM6IFs1MTIxLCAzMjgxOSwgMzI4MjBdXG4gIH0sXG4gIFs2NDA2XToge1xuICAgIGRhdGFGb3JtYXQ6IDY0MDYsXG4gICAgdHlwZXM6IFs1MTIxXVxuICB9LFxuICBbNjQwOV06IHtcbiAgICBkYXRhRm9ybWF0OiA2NDA5LFxuICAgIHR5cGVzOiBbNTEyMV1cbiAgfSxcbiAgWzY0MTBdOiB7XG4gICAgZGF0YUZvcm1hdDogNjQxMCxcbiAgICB0eXBlczogWzUxMjFdXG4gIH0sXG4gIFszMzMyNl06IHtcbiAgICBkYXRhRm9ybWF0OiA2NDAzLFxuICAgIHR5cGVzOiBbNTEyNl0sXG4gICAgZ2wyOiB0cnVlXG4gIH0sXG4gIFszMzMyOF06IHtcbiAgICBkYXRhRm9ybWF0OiAzMzMxOSxcbiAgICB0eXBlczogWzUxMjZdLFxuICAgIGdsMjogdHJ1ZVxuICB9LFxuICBbMzQ4MzddOiB7XG4gICAgZGF0YUZvcm1hdDogNjQwNyxcbiAgICB0eXBlczogWzUxMjZdLFxuICAgIGdsMjogdHJ1ZVxuICB9LFxuICBbMzQ4MzZdOiB7XG4gICAgZGF0YUZvcm1hdDogNjQwOCxcbiAgICB0eXBlczogWzUxMjZdLFxuICAgIGdsMjogdHJ1ZVxuICB9XG59O1xuZXhwb3J0IGNvbnN0IERBVEFfRk9STUFUX0NIQU5ORUxTID0ge1xuICBbNjQwM106IDEsXG4gIFszNjI0NF06IDEsXG4gIFszMzMxOV06IDIsXG4gIFszMzMyMF06IDIsXG4gIFs2NDA3XTogMyxcbiAgWzM2MjQ4XTogMyxcbiAgWzY0MDhdOiA0LFxuICBbMzYyNDldOiA0LFxuICBbNjQwMl06IDEsXG4gIFszNDA0MV06IDEsXG4gIFs2NDA2XTogMSxcbiAgWzY0MDldOiAxLFxuICBbNjQxMF06IDJcbn07XG5leHBvcnQgY29uc3QgVFlQRV9TSVpFUyA9IHtcbiAgWzUxMjZdOiA0LFxuICBbNTEyNV06IDQsXG4gIFs1MTI0XTogNCxcbiAgWzUxMjNdOiAyLFxuICBbNTEyMl06IDIsXG4gIFs1MTMxXTogMixcbiAgWzUxMjBdOiAxLFxuICBbNTEyMV06IDFcbn07XG5leHBvcnQgZnVuY3Rpb24gaXNGb3JtYXRTdXBwb3J0ZWQoZ2wsIGZvcm1hdCkge1xuICBjb25zdCBpbmZvID0gVEVYVFVSRV9GT1JNQVRTW2Zvcm1hdF07XG5cbiAgaWYgKCFpbmZvKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGluZm8uZ2wxID09PSB1bmRlZmluZWQgJiYgaW5mby5nbDIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgdmFsdWUgPSBpc1dlYkdMMihnbCkgPyBpbmZvLmdsMiB8fCBpbmZvLmdsMSA6IGluZm8uZ2wxO1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IGdsLmdldEV4dGVuc2lvbih2YWx1ZSkgOiB2YWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0xpbmVhckZpbHRlcmluZ1N1cHBvcnRlZChnbCwgZm9ybWF0KSB7XG4gIGNvbnN0IGluZm8gPSBURVhUVVJFX0ZPUk1BVFNbZm9ybWF0XTtcblxuICBzd2l0Y2ggKGluZm8gJiYgaW5mby50eXBlc1swXSkge1xuICAgIGNhc2UgNTEyNjpcbiAgICAgIHJldHVybiBnbC5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpO1xuXG4gICAgY2FzZSA1MTMxOlxuICAgICAgcmV0dXJuIGdsLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfaGFsZl9mbG9hdF9saW5lYXInKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGV4dHVyZS1mb3JtYXRzLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyLCBhc3NlcnRXZWJHTDJDb250ZXh0LCB3aXRoUGFyYW1ldGVycywgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBnbG9iYWwgfSBmcm9tICdwcm9iZS5nbC9lbnYnO1xuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuaW1wb3J0IEJ1ZmZlciBmcm9tICcuL2J1ZmZlcic7XG5pbXBvcnQgeyBURVhUVVJFX0ZPUk1BVFMsIERBVEFfRk9STUFUX0NIQU5ORUxTLCBUWVBFX1NJWkVTLCBpc0Zvcm1hdFN1cHBvcnRlZCwgaXNMaW5lYXJGaWx0ZXJpbmdTdXBwb3J0ZWQgfSBmcm9tICcuL3RleHR1cmUtZm9ybWF0cyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgdWlkLCBpc1Bvd2VyT2ZUd28gfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5jb25zdCBOUE9UX01JTl9GSUxURVJTID0gWzk3MjksIDk3MjhdO1xuXG5jb25zdCBXZWJHTEJ1ZmZlciA9IGdsb2JhbC5XZWJHTEJ1ZmZlciB8fCBmdW5jdGlvbiBXZWJHTEJ1ZmZlcigpIHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dXJlIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGZvcm1hdCxcbiAgICAgIGxpbmVhckZpbHRlcmluZ1xuICAgIH0gPSBvcHRzO1xuICAgIGxldCBzdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgaWYgKGZvcm1hdCkge1xuICAgICAgc3VwcG9ydGVkID0gc3VwcG9ydGVkICYmIGlzRm9ybWF0U3VwcG9ydGVkKGdsLCBmb3JtYXQpO1xuICAgICAgc3VwcG9ydGVkID0gc3VwcG9ydGVkICYmICghbGluZWFyRmlsdGVyaW5nIHx8IGlzTGluZWFyRmlsdGVyaW5nU3VwcG9ydGVkKGdsLCBmb3JtYXQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwcG9ydGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzKSB7XG4gICAgY29uc3Qge1xuICAgICAgaWQgPSB1aWQoJ3RleHR1cmUnKSxcbiAgICAgIGhhbmRsZSxcbiAgICAgIHRhcmdldFxuICAgIH0gPSBwcm9wcztcbiAgICBzdXBlcihnbCwge1xuICAgICAgaWQsXG4gICAgICBoYW5kbGVcbiAgICB9KTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLnRleHR1cmVVbml0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgdGhpcy53aWR0aCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmhlaWdodCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRlcHRoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZm9ybWF0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudHlwZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRhdGFGb3JtYXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5ib3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50ZXh0dXJlVW5pdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1pcG1hcHMgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYFRleHR1cmUoJHt0aGlzLmlkfSwke3RoaXMud2lkdGh9eCR7dGhpcy5oZWlnaHR9KWA7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICBsZXQgZGF0YSA9IHByb3BzLmRhdGE7XG5cbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIGRhdGEudGhlbihyZXNvbHZlZEltYWdlRGF0YSA9PiB0aGlzLmluaXRpYWxpemUoT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgcGl4ZWxzOiByZXNvbHZlZEltYWdlRGF0YSxcbiAgICAgICAgZGF0YTogcmVzb2x2ZWRJbWFnZURhdGFcbiAgICAgIH0pKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdCBpc1ZpZGVvID0gdHlwZW9mIEhUTUxWaWRlb0VsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRhdGEgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50O1xuXG4gICAgaWYgKGlzVmlkZW8gJiYgZGF0YS5yZWFkeVN0YXRlIDwgSFRNTFZpZGVvRWxlbWVudC5IQVZFX01FVEFEQVRBKSB7XG4gICAgICB0aGlzLl92aWRlbyA9IG51bGw7XG4gICAgICBkYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlZGRhdGEnLCAoKSA9PiB0aGlzLmluaXRpYWxpemUocHJvcHMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIHBpeGVscyA9IG51bGwsXG4gICAgICBmb3JtYXQgPSA2NDA4LFxuICAgICAgYm9yZGVyID0gMCxcbiAgICAgIHJlY3JlYXRlID0gZmFsc2UsXG4gICAgICBwYXJhbWV0ZXJzID0ge30sXG4gICAgICBwaXhlbFN0b3JlID0ge30sXG4gICAgICB0ZXh0dXJlVW5pdCA9IHVuZGVmaW5lZFxuICAgIH0gPSBwcm9wcztcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHBpeGVscztcbiAgICB9XG5cbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgdHlwZSxcbiAgICAgIGNvbXByZXNzZWQgPSBmYWxzZSxcbiAgICAgIG1pcG1hcHMgPSB0cnVlXG4gICAgfSA9IHByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGRlcHRoID0gMFxuICAgIH0gPSBwcm9wcztcbiAgICAoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBjb21wcmVzc2VkLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIHR5cGVcbiAgICB9ID0gdGhpcy5fZGVkdWNlUGFyYW1ldGVycyh7XG4gICAgICBmb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICBkYXRhLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KSk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZGF0YUZvcm1hdCA9IGRhdGFGb3JtYXQ7XG4gICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XG4gICAgdGhpcy50ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0O1xuXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZSh0aGlzLnRleHR1cmVVbml0KSkge1xuICAgICAgdGhpcy5nbC5hY3RpdmVUZXh0dXJlKDMzOTg0ICsgdGhpcy50ZXh0dXJlVW5pdCk7XG4gICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKG1pcG1hcHMgJiYgdGhpcy5faXNOUE9UKCkpIHtcbiAgICAgIGxvZy53YXJuKGB0ZXh0dXJlOiAke3RoaXN9IGlzIE5vbi1Qb3dlci1PZi1Ud28sIGRpc2FibGluZyBtaXBtYXBpbmdgKSgpO1xuICAgICAgbWlwbWFwcyA9IGZhbHNlO1xuXG4gICAgICB0aGlzLl91cGRhdGVGb3JOUE9UKHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIHRoaXMubWlwbWFwcyA9IG1pcG1hcHM7XG4gICAgdGhpcy5zZXRJbWFnZURhdGEoe1xuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgZGVwdGgsXG4gICAgICBmb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIGJvcmRlcixcbiAgICAgIG1pcG1hcHMsXG4gICAgICBwYXJhbWV0ZXJzOiBwaXhlbFN0b3JlLFxuICAgICAgY29tcHJlc3NlZFxuICAgIH0pO1xuXG4gICAgaWYgKG1pcG1hcHMpIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXAoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFBhcmFtZXRlcnMocGFyYW1ldGVycyk7XG5cbiAgICBpZiAocmVjcmVhdGUpIHtcbiAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxuXG4gICAgaWYgKGlzVmlkZW8pIHtcbiAgICAgIHRoaXMuX3ZpZGVvID0ge1xuICAgICAgICB2aWRlbzogZGF0YSxcbiAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgbGFzdFRpbWU6IGRhdGEucmVhZHlTdGF0ZSA+PSBIVE1MVmlkZW9FbGVtZW50LkhBVkVfQ1VSUkVOVF9EQVRBID8gZGF0YS5jdXJyZW50VGltZSA6IC0xXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLl92aWRlbykge1xuICAgICAgY29uc3Qge1xuICAgICAgICB2aWRlbyxcbiAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgbGFzdFRpbWVcbiAgICAgIH0gPSB0aGlzLl92aWRlbztcblxuICAgICAgaWYgKGxhc3RUaW1lID09PSB2aWRlby5jdXJyZW50VGltZSB8fCB2aWRlby5yZWFkeVN0YXRlIDwgSFRNTFZpZGVvRWxlbWVudC5IQVZFX0NVUlJFTlRfREFUQSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3ViSW1hZ2VEYXRhKHtcbiAgICAgICAgZGF0YTogdmlkZW8sXG4gICAgICAgIHBhcmFtZXRlcnNcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5taXBtYXBzKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXAoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdmlkZW8ubGFzdFRpbWUgPSB2aWRlby5jdXJyZW50VGltZTtcbiAgICB9XG4gIH1cblxuICByZXNpemUoe1xuICAgIGhlaWdodCxcbiAgICB3aWR0aCxcbiAgICBtaXBtYXBzID0gZmFsc2VcbiAgfSkge1xuICAgIGlmICh3aWR0aCAhPT0gdGhpcy53aWR0aCB8fCBoZWlnaHQgIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgZm9ybWF0OiB0aGlzLmZvcm1hdCxcbiAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICBkYXRhRm9ybWF0OiB0aGlzLmRhdGFGb3JtYXQsXG4gICAgICAgIGJvcmRlcjogdGhpcy5ib3JkZXIsXG4gICAgICAgIG1pcG1hcHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2VuZXJhdGVNaXBtYXAocGFyYW1zID0ge30pIHtcbiAgICBpZiAodGhpcy5faXNOUE9UKCkpIHtcbiAgICAgIGxvZy53YXJuKGB0ZXh0dXJlOiAke3RoaXN9IGlzIE5vbi1Qb3dlci1PZi1Ud28sIGRpc2FibGluZyBtaXBtYXBpbmdgKSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5taXBtYXBzID0gdHJ1ZTtcbiAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgd2l0aFBhcmFtZXRlcnModGhpcy5nbCwgcGFyYW1zLCAoKSA9PiB7XG4gICAgICB0aGlzLmdsLmdlbmVyYXRlTWlwbWFwKHRoaXMudGFyZ2V0KTtcbiAgICB9KTtcbiAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEltYWdlRGF0YShvcHRpb25zKSB7XG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgnVGV4dHVyZScpO1xuXG4gICAgY29uc3Qge1xuICAgICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQsXG4gICAgICBwaXhlbHMgPSBudWxsLFxuICAgICAgbGV2ZWwgPSAwLFxuICAgICAgZm9ybWF0ID0gdGhpcy5mb3JtYXQsXG4gICAgICBib3JkZXIgPSB0aGlzLmJvcmRlcixcbiAgICAgIG9mZnNldCA9IDAsXG4gICAgICBwYXJhbWV0ZXJzID0ge31cbiAgICB9ID0gb3B0aW9ucztcbiAgICBsZXQge1xuICAgICAgZGF0YSA9IG51bGwsXG4gICAgICB0eXBlID0gdGhpcy50eXBlLFxuICAgICAgd2lkdGggPSB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsXG4gICAgICBkYXRhRm9ybWF0ID0gdGhpcy5kYXRhRm9ybWF0LFxuICAgICAgY29tcHJlc3NlZCA9IGZhbHNlXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSBwaXhlbHM7XG4gICAgfVxuXG4gICAgKHtcbiAgICAgIHR5cGUsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgY29tcHJlc3NlZCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSA9IHRoaXMuX2RlZHVjZVBhcmFtZXRlcnMoe1xuICAgICAgZm9ybWF0LFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICBjb21wcmVzc2VkLFxuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSkpO1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICBsZXQgZGF0YVR5cGUgPSBudWxsO1xuICAgICh7XG4gICAgICBkYXRhLFxuICAgICAgZGF0YVR5cGVcbiAgICB9ID0gdGhpcy5fZ2V0RGF0YVR5cGUoe1xuICAgICAgZGF0YSxcbiAgICAgIGNvbXByZXNzZWRcbiAgICB9KSk7XG4gICAgbGV0IGdsMjtcbiAgICB3aXRoUGFyYW1ldGVycyh0aGlzLmdsLCBwYXJhbWV0ZXJzLCAoKSA9PiB7XG4gICAgICBzd2l0Y2ggKGRhdGFUeXBlKSB7XG4gICAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGRhdGFGb3JtYXQsIHR5cGUsIGRhdGEpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3R5cGVkLWFycmF5JzpcbiAgICAgICAgICBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBkYXRhRm9ybWF0LCB0eXBlLCBkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2J1ZmZlcic6XG4gICAgICAgICAgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgICAgICAgZ2wyLmJpbmRCdWZmZXIoMzUwNTIsIGRhdGEuaGFuZGxlIHx8IGRhdGEpO1xuICAgICAgICAgIGdsMi50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBkYXRhRm9ybWF0LCB0eXBlLCBvZmZzZXQpO1xuICAgICAgICAgIGdsMi5iaW5kQnVmZmVyKDM1MDUyLCBudWxsKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdicm93c2VyLW9iamVjdCc6XG4gICAgICAgICAgaWYgKGlzV2ViR0wyKGdsKSkge1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZGF0YUZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgZm9ybWF0LCBkYXRhRm9ybWF0LCB0eXBlLCBkYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjb21wcmVzc2VkJzpcbiAgICAgICAgICBmb3IgKGNvbnN0IFtsZXZlbEluZGV4LCBsZXZlbERhdGFdIG9mIGRhdGEuZW50cmllcygpKSB7XG4gICAgICAgICAgICBnbC5jb21wcmVzc2VkVGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsSW5kZXgsIGxldmVsRGF0YS5mb3JtYXQsIGxldmVsRGF0YS53aWR0aCwgbGV2ZWxEYXRhLmhlaWdodCwgYm9yZGVyLCBsZXZlbERhdGEuZGF0YSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBhc3NlcnQoZmFsc2UsICdVbmtub3duIGltYWdlIGRhdGEgdHlwZScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aGlzLl90cmFja0FsbG9jYXRlZE1lbW9yeShkYXRhLmJ5dGVMZW5ndGgsICdUZXh0dXJlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNoYW5uZWxzID0gREFUQV9GT1JNQVRfQ0hBTk5FTFNbdGhpcy5kYXRhRm9ybWF0XSB8fCA0O1xuICAgICAgY29uc3QgY2hhbm5lbFNpemUgPSBUWVBFX1NJWkVTW3RoaXMudHlwZV0gfHwgMTtcblxuICAgICAgdGhpcy5fdHJhY2tBbGxvY2F0ZWRNZW1vcnkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogY2hhbm5lbHMgKiBjaGFubmVsU2l6ZSwgJ1RleHR1cmUnKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRTdWJJbWFnZURhdGEoe1xuICAgIHRhcmdldCA9IHRoaXMudGFyZ2V0LFxuICAgIHBpeGVscyA9IG51bGwsXG4gICAgZGF0YSA9IG51bGwsXG4gICAgeCA9IDAsXG4gICAgeSA9IDAsXG4gICAgd2lkdGggPSB0aGlzLndpZHRoLFxuICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0LFxuICAgIGxldmVsID0gMCxcbiAgICBmb3JtYXQgPSB0aGlzLmZvcm1hdCxcbiAgICB0eXBlID0gdGhpcy50eXBlLFxuICAgIGRhdGFGb3JtYXQgPSB0aGlzLmRhdGFGb3JtYXQsXG4gICAgY29tcHJlc3NlZCA9IGZhbHNlLFxuICAgIG9mZnNldCA9IDAsXG4gICAgYm9yZGVyID0gdGhpcy5ib3JkZXIsXG4gICAgcGFyYW1ldGVycyA9IHt9XG4gIH0pIHtcbiAgICAoe1xuICAgICAgdHlwZSxcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICBjb21wcmVzc2VkLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9ID0gdGhpcy5fZGVkdWNlUGFyYW1ldGVycyh7XG4gICAgICBmb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICBkYXRhLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KSk7XG4gICAgYXNzZXJ0KHRoaXMuZGVwdGggPT09IDAsICd0ZXhTdWJJbWFnZSBub3Qgc3VwcG9ydGVkIGZvciAzRCB0ZXh0dXJlcycpO1xuXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0gcGl4ZWxzO1xuICAgIH1cblxuICAgIGlmIChkYXRhICYmIGRhdGEuZGF0YSkge1xuICAgICAgY29uc3QgbmRhcnJheSA9IGRhdGE7XG4gICAgICBkYXRhID0gbmRhcnJheS5kYXRhO1xuICAgICAgd2lkdGggPSBuZGFycmF5LnNoYXBlWzBdO1xuICAgICAgaGVpZ2h0ID0gbmRhcnJheS5zaGFwZVsxXTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgZGF0YSA9IGRhdGEuaGFuZGxlO1xuICAgIH1cblxuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB3aXRoUGFyYW1ldGVycyh0aGlzLmdsLCBwYXJhbWV0ZXJzLCAoKSA9PiB7XG4gICAgICBpZiAoY29tcHJlc3NlZCkge1xuICAgICAgICB0aGlzLmdsLmNvbXByZXNzZWRUZXhTdWJJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZvcm1hdCwgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhTdWJJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGRhdGFGb3JtYXQsIHR5cGUsIG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhTdWJJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGRhdGFGb3JtYXQsIHR5cGUsIGRhdGEsIG9mZnNldCk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlcikge1xuICAgICAgICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KHRoaXMuZ2wpO1xuICAgICAgICBnbDIuYmluZEJ1ZmZlcigzNTA1MiwgZGF0YSk7XG4gICAgICAgIGdsMi50ZXhTdWJJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGRhdGFGb3JtYXQsIHR5cGUsIG9mZnNldCk7XG4gICAgICAgIGdsMi5iaW5kQnVmZmVyKDM1MDUyLCBudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNXZWJHTDIodGhpcy5nbCkpIHtcbiAgICAgICAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcbiAgICAgICAgZ2wyLnRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgZGF0YUZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdsLnRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgZGF0YUZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgbnVsbCk7XG4gIH1cblxuICBjb3B5RnJhbWVidWZmZXIob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdUZXh0dXJlLmNvcHlGcmFtZWJ1ZmZlcih7Li4ufSkgaXMgbm8gbG9nbmVyIHN1cHBvcnRlZCwgdXNlIGNvcHlUb1RleHR1cmUoc291cmNlLCB0YXJnZXQsIG9wdHN9KScpKCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRBY3RpdmVVbml0KCkge1xuICAgIHJldHVybiB0aGlzLmdsLmdldFBhcmFtZXRlcigzNDAxNikgLSAzMzk4NDtcbiAgfVxuXG4gIGJpbmQodGV4dHVyZVVuaXQgPSB0aGlzLnRleHR1cmVVbml0KSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcblxuICAgIGlmICh0ZXh0dXJlVW5pdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQ7XG4gICAgICBnbC5hY3RpdmVUZXh0dXJlKDMzOTg0ICsgdGV4dHVyZVVuaXQpO1xuICAgIH1cblxuICAgIGdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgcmV0dXJuIHRleHR1cmVVbml0O1xuICB9XG5cbiAgdW5iaW5kKHRleHR1cmVVbml0ID0gdGhpcy50ZXh0dXJlVW5pdCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG5cbiAgICBpZiAodGV4dHVyZVVuaXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy50ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0O1xuICAgICAgZ2wuYWN0aXZlVGV4dHVyZSgzMzk4NCArIHRleHR1cmVVbml0KTtcbiAgICB9XG5cbiAgICBnbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgcmV0dXJuIHRleHR1cmVVbml0O1xuICB9XG5cbiAgX2dldERhdGFUeXBlKHtcbiAgICBkYXRhLFxuICAgIGNvbXByZXNzZWQgPSBmYWxzZVxuICB9KSB7XG4gICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIGRhdGFUeXBlOiAnY29tcHJlc3NlZCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIGRhdGFUeXBlOiAnbnVsbCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICd0eXBlZC1hcnJheSdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IGRhdGEuaGFuZGxlLFxuICAgICAgICBkYXRhVHlwZTogJ2J1ZmZlcidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdidWZmZXInXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkYXRhLFxuICAgICAgZGF0YVR5cGU6ICdicm93c2VyLW9iamVjdCdcbiAgICB9O1xuICB9XG5cbiAgX2RlZHVjZVBhcmFtZXRlcnMob3B0cykge1xuICAgIGNvbnN0IHtcbiAgICAgIGZvcm1hdCxcbiAgICAgIGRhdGFcbiAgICB9ID0gb3B0cztcbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgdHlwZSxcbiAgICAgIGNvbXByZXNzZWRcbiAgICB9ID0gb3B0cztcbiAgICBjb25zdCB0ZXh0dXJlRm9ybWF0ID0gVEVYVFVSRV9GT1JNQVRTW2Zvcm1hdF07XG4gICAgZGF0YUZvcm1hdCA9IGRhdGFGb3JtYXQgfHwgdGV4dHVyZUZvcm1hdCAmJiB0ZXh0dXJlRm9ybWF0LmRhdGFGb3JtYXQ7XG4gICAgdHlwZSA9IHR5cGUgfHwgdGV4dHVyZUZvcm1hdCAmJiB0ZXh0dXJlRm9ybWF0LnR5cGVzWzBdO1xuICAgIGNvbXByZXNzZWQgPSBjb21wcmVzc2VkIHx8IHRleHR1cmVGb3JtYXQgJiYgdGV4dHVyZUZvcm1hdC5jb21wcmVzc2VkO1xuICAgICh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0gPSB0aGlzLl9kZWR1Y2VJbWFnZVNpemUoZGF0YSwgd2lkdGgsIGhlaWdodCkpO1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgdHlwZSxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGZvcm1hdCxcbiAgICAgIGRhdGFcbiAgICB9O1xuICB9XG5cbiAgX2RlZHVjZUltYWdlU2l6ZShkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IHNpemU7XG5cbiAgICBpZiAodHlwZW9mIEltYWdlRGF0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEltYWdlRGF0YSkge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGRhdGEud2lkdGgsXG4gICAgICAgIGhlaWdodDogZGF0YS5oZWlnaHRcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgSFRNTEltYWdlRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHtcbiAgICAgIHNpemUgPSB7XG4gICAgICAgIHdpZHRoOiBkYXRhLm5hdHVyYWxXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiBkYXRhLm5hdHVyYWxIZWlnaHRcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgSFRNTENhbnZhc0VsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRhdGEgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGRhdGEud2lkdGgsXG4gICAgICAgIGhlaWdodDogZGF0YS5oZWlnaHRcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgSW1hZ2VCaXRtYXAgIT09ICd1bmRlZmluZWQnICYmIGRhdGEgaW5zdGFuY2VvZiBJbWFnZUJpdG1hcCkge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGRhdGEud2lkdGgsXG4gICAgICAgIGhlaWdodDogZGF0YS5oZWlnaHRcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgSFRNTFZpZGVvRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQpIHtcbiAgICAgIHNpemUgPSB7XG4gICAgICAgIHdpZHRoOiBkYXRhLnZpZGVvV2lkdGgsXG4gICAgICAgIGhlaWdodDogZGF0YS52aWRlb0hlaWdodFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKCFkYXRhKSB7XG4gICAgICBzaXplID0ge1xuICAgICAgICB3aWR0aDogd2lkdGggPj0gMCA/IHdpZHRoIDogMSxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgPj0gMCA/IGhlaWdodCA6IDFcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpemUgPSB7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYXNzZXJ0KHNpemUsICdDb3VsZCBub3QgZGVkdWNlZCB0ZXh0dXJlIHNpemUnKTtcbiAgICBhc3NlcnQod2lkdGggPT09IHVuZGVmaW5lZCB8fCBzaXplLndpZHRoID09PSB3aWR0aCwgJ0RlZHVjZWQgdGV4dHVyZSB3aWR0aCBkb2VzIG5vdCBtYXRjaCBzdXBwbGllZCB3aWR0aCcpO1xuICAgIGFzc2VydChoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBzaXplLmhlaWdodCA9PT0gaGVpZ2h0LCAnRGVkdWNlZCB0ZXh0dXJlIGhlaWdodCBkb2VzIG5vdCBtYXRjaCBzdXBwbGllZCBoZWlnaHQnKTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aGlzLmdsLmRlbGV0ZVRleHR1cmUodGhpcy5oYW5kbGUpO1xuXG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgnVGV4dHVyZScpO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSkge1xuICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgIGNhc2UgNDA5NjpcbiAgICAgICAgcmV0dXJuIHRoaXMud2lkdGg7XG5cbiAgICAgIGNhc2UgNDA5NzpcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nbC5nZXRUZXhQYXJhbWV0ZXIodGhpcy50YXJnZXQsIHBuYW1lKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBfc2V0UGFyYW1ldGVyKHBuYW1lLCBwYXJhbSkge1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICBwYXJhbSA9IHRoaXMuX2dldE5QT1RQYXJhbShwbmFtZSwgcGFyYW0pO1xuXG4gICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgY2FzZSAzMzA4MjpcbiAgICAgIGNhc2UgMzMwODM6XG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyZih0aGlzLmhhbmRsZSwgcG5hbWUsIHBhcmFtKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNDA5NjpcbiAgICAgIGNhc2UgNDA5NzpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgcG5hbWUsIHBhcmFtKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaXNOUE9UKCkge1xuICAgIGlmIChpc1dlYkdMMih0aGlzLmdsKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy53aWR0aCB8fCAhdGhpcy5oZWlnaHQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gIWlzUG93ZXJPZlR3byh0aGlzLndpZHRoKSB8fCAhaXNQb3dlck9mVHdvKHRoaXMuaGVpZ2h0KTtcbiAgfVxuXG4gIF91cGRhdGVGb3JOUE9UKHBhcmFtZXRlcnMpIHtcbiAgICBpZiAocGFyYW1ldGVyc1t0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUl0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFyYW1ldGVyc1t0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUl0gPSB0aGlzLmdsLkxJTkVBUjtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1ldGVyc1t0aGlzLmdsLlRFWFRVUkVfV1JBUF9TXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbWV0ZXJzW3RoaXMuZ2wuVEVYVFVSRV9XUkFQX1NdID0gdGhpcy5nbC5DTEFNUF9UT19FREdFO1xuICAgIH1cblxuICAgIGlmIChwYXJhbWV0ZXJzW3RoaXMuZ2wuVEVYVFVSRV9XUkFQX1RdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtZXRlcnNbdGhpcy5nbC5URVhUVVJFX1dSQVBfVF0gPSB0aGlzLmdsLkNMQU1QX1RPX0VER0U7XG4gICAgfVxuICB9XG5cbiAgX2dldE5QT1RQYXJhbShwbmFtZSwgcGFyYW0pIHtcbiAgICBpZiAodGhpcy5faXNOUE9UKCkpIHtcbiAgICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgICAgY2FzZSAxMDI0MTpcbiAgICAgICAgICBpZiAoTlBPVF9NSU5fRklMVEVSUy5pbmRleE9mKHBhcmFtKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtID0gOTcyOTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDEwMjQyOlxuICAgICAgICBjYXNlIDEwMjQzOlxuICAgICAgICAgIGlmIChwYXJhbSAhPT0gMzMwNzEpIHtcbiAgICAgICAgICAgIHBhcmFtID0gMzMwNzE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW07XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGV4dHVyZS5qcy5tYXAiLCJpbXBvcnQgeyBpc1dlYkdMMiwgYXNzZXJ0V2ViR0wyQ29udGV4dCwgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgQnVmZmVyIGZyb20gJy4vYnVmZmVyJztcbmltcG9ydCB7IGlzT2JqZWN0RW1wdHkgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc2Zvcm1GZWVkYmFjayBleHRlbmRzIFJlc291cmNlIHtcbiAgc3RhdGljIGlzU3VwcG9ydGVkKGdsKSB7XG4gICAgcmV0dXJuIGlzV2ViR0wyKGdsKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcyA9IHt9KSB7XG4gICAgYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgc3VwZXIoZ2wsIHByb3BzKTtcbiAgICB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICAgIHRoaXMuc3R1YlJlbW92ZWRNZXRob2RzKCdUcmFuc2Zvcm1GZWVkYmFjaycsICd2Ni4wJywgWydwYXVzZScsICdyZXN1bWUnXSk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICB0aGlzLmJ1ZmZlcnMgPSB7fTtcbiAgICB0aGlzLnVudXNlZCA9IHt9O1xuICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IG51bGw7XG4gICAgdGhpcy5iaW5kT25Vc2UgPSB0cnVlO1xuXG4gICAgaWYgKCFpc09iamVjdEVtcHR5KHRoaXMuYnVmZmVycykpIHtcbiAgICAgIHRoaXMuYmluZCgoKSA9PiB0aGlzLl91bmJpbmRCdWZmZXJzKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0UHJvcHMocHJvcHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoJ3Byb2dyYW0nIGluIHByb3BzKSB7XG4gICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBwcm9wcy5wcm9ncmFtICYmIHByb3BzLnByb2dyYW0uY29uZmlndXJhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoJ2NvbmZpZ3VyYXRpb24nIGluIHByb3BzKSB7XG4gICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBwcm9wcy5jb25maWd1cmF0aW9uO1xuICAgIH1cblxuICAgIGlmICgnYmluZE9uVXNlJyBpbiBwcm9wcykge1xuICAgICAgcHJvcHMgPSBwcm9wcy5iaW5kT25Vc2U7XG4gICAgfVxuXG4gICAgaWYgKCdidWZmZXJzJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRCdWZmZXJzKHByb3BzLmJ1ZmZlcnMpO1xuICAgIH1cbiAgfVxuXG4gIHNldEJ1ZmZlcnMoYnVmZmVycyA9IHt9KSB7XG4gICAgdGhpcy5iaW5kKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgYnVmZmVyTmFtZSBpbiBidWZmZXJzKSB7XG4gICAgICAgIHRoaXMuc2V0QnVmZmVyKGJ1ZmZlck5hbWUsIGJ1ZmZlcnNbYnVmZmVyTmFtZV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QnVmZmVyKGxvY2F0aW9uT3JOYW1lLCBidWZmZXJPclBhcmFtcykge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5fZ2V0VmFyeWluZ0luZGV4KGxvY2F0aW9uT3JOYW1lKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGJ1ZmZlcixcbiAgICAgIGJ5dGVTaXplLFxuICAgICAgYnl0ZU9mZnNldFxuICAgIH0gPSB0aGlzLl9nZXRCdWZmZXJQYXJhbXMoYnVmZmVyT3JQYXJhbXMpO1xuXG4gICAgaWYgKGxvY2F0aW9uIDwgMCkge1xuICAgICAgdGhpcy51bnVzZWRbbG9jYXRpb25Pck5hbWVdID0gYnVmZmVyO1xuICAgICAgbG9nLndhcm4oKCkgPT4gYCR7dGhpcy5pZH0gdW51c2VkIHZhcnlpbmcgYnVmZmVyICR7bG9jYXRpb25Pck5hbWV9YCkoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyc1tsb2NhdGlvbl0gPSBidWZmZXJPclBhcmFtcztcblxuICAgIGlmICghdGhpcy5iaW5kT25Vc2UpIHtcbiAgICAgIHRoaXMuX2JpbmRCdWZmZXIobG9jYXRpb24sIGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZVNpemUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYmVnaW4ocHJpbWl0aXZlTW9kZSA9IDApIHtcbiAgICB0aGlzLmdsLmJpbmRUcmFuc2Zvcm1GZWVkYmFjaygzNjM4NiwgdGhpcy5oYW5kbGUpO1xuXG4gICAgdGhpcy5fYmluZEJ1ZmZlcnMoKTtcblxuICAgIHRoaXMuZ2wuYmVnaW5UcmFuc2Zvcm1GZWVkYmFjayhwcmltaXRpdmVNb2RlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGVuZCgpIHtcbiAgICB0aGlzLmdsLmVuZFRyYW5zZm9ybUZlZWRiYWNrKCk7XG5cbiAgICB0aGlzLl91bmJpbmRCdWZmZXJzKCk7XG5cbiAgICB0aGlzLmdsLmJpbmRUcmFuc2Zvcm1GZWVkYmFjaygzNjM4NiwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZ2V0QnVmZmVyUGFyYW1zKGJ1ZmZlck9yUGFyYW1zKSB7XG4gICAgbGV0IGJ5dGVPZmZzZXQ7XG4gICAgbGV0IGJ5dGVTaXplO1xuICAgIGxldCBidWZmZXI7XG5cbiAgICBpZiAoYnVmZmVyT3JQYXJhbXMgaW5zdGFuY2VvZiBCdWZmZXIgPT09IGZhbHNlKSB7XG4gICAgICBidWZmZXIgPSBidWZmZXJPclBhcmFtcy5idWZmZXI7XG4gICAgICBieXRlU2l6ZSA9IGJ1ZmZlck9yUGFyYW1zLmJ5dGVTaXplO1xuICAgICAgYnl0ZU9mZnNldCA9IGJ1ZmZlck9yUGFyYW1zLmJ5dGVPZmZzZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciA9IGJ1ZmZlck9yUGFyYW1zO1xuICAgIH1cblxuICAgIGlmIChieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgfHwgYnl0ZVNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYnl0ZU9mZnNldCA9IGJ5dGVPZmZzZXQgfHwgMDtcbiAgICAgIGJ5dGVTaXplID0gYnl0ZVNpemUgfHwgYnVmZmVyLmJ5dGVMZW5ndGggLSBieXRlT2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBidWZmZXIsXG4gICAgICBieXRlT2Zmc2V0LFxuICAgICAgYnl0ZVNpemVcbiAgICB9O1xuICB9XG5cbiAgX2dldFZhcnlpbmdJbmZvKGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbiAmJiB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0VmFyeWluZ0luZm8obG9jYXRpb25Pck5hbWUpO1xuICB9XG5cbiAgX2dldFZhcnlpbmdJbmRleChsb2NhdGlvbk9yTmFtZSkge1xuICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0VmFyeWluZ0luZm8obG9jYXRpb25Pck5hbWUpLmxvY2F0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uT3JOYW1lKTtcbiAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKGxvY2F0aW9uKSA/IGxvY2F0aW9uIDogLTE7XG4gIH1cblxuICBfYmluZEJ1ZmZlcnMoKSB7XG4gICAgaWYgKHRoaXMuYmluZE9uVXNlKSB7XG4gICAgICBmb3IgKGNvbnN0IGJ1ZmZlckluZGV4IGluIHRoaXMuYnVmZmVycykge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgIGJ5dGVTaXplLFxuICAgICAgICAgIGJ5dGVPZmZzZXRcbiAgICAgICAgfSA9IHRoaXMuX2dldEJ1ZmZlclBhcmFtcyh0aGlzLmJ1ZmZlcnNbYnVmZmVySW5kZXhdKTtcblxuICAgICAgICB0aGlzLl9iaW5kQnVmZmVyKGJ1ZmZlckluZGV4LCBidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVTaXplKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdW5iaW5kQnVmZmVycygpIHtcbiAgICBpZiAodGhpcy5iaW5kT25Vc2UpIHtcbiAgICAgIGZvciAoY29uc3QgYnVmZmVySW5kZXggaW4gdGhpcy5idWZmZXJzKSB7XG4gICAgICAgIHRoaXMuX2JpbmRCdWZmZXIoYnVmZmVySW5kZXgsIG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9iaW5kQnVmZmVyKGluZGV4LCBidWZmZXIsIGJ5dGVPZmZzZXQgPSAwLCBieXRlU2l6ZSkge1xuICAgIGNvbnN0IGhhbmRsZSA9IGJ1ZmZlciAmJiBidWZmZXIuaGFuZGxlO1xuXG4gICAgaWYgKCFoYW5kbGUgfHwgYnl0ZVNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyQmFzZSgzNTk4MiwgaW5kZXgsIGhhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlclJhbmdlKDM1OTgyLCBpbmRleCwgaGFuZGxlLCBieXRlT2Zmc2V0LCBieXRlU2l6ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmNyZWF0ZVRyYW5zZm9ybUZlZWRiYWNrKCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wuZGVsZXRlVHJhbnNmb3JtRmVlZGJhY2sodGhpcy5oYW5kbGUpO1xuICB9XG5cbiAgX2JpbmRIYW5kbGUoaGFuZGxlKSB7XG4gICAgdGhpcy5nbC5iaW5kVHJhbnNmb3JtRmVlZGJhY2soMzYzODYsIHRoaXMuaGFuZGxlKTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10cmFuc2Zvcm0tZmVlZGJhY2suanMubWFwIiwiaW1wb3J0IHsgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi9mcmFtZWJ1ZmZlcic7XG5pbXBvcnQgUmVuZGVyYnVmZmVyIGZyb20gJy4vcmVuZGVyYnVmZmVyJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4vdGV4dHVyZSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuY29uc3QgVU5JRk9STV9TRVRURVJTID0ge1xuICBbNTEyNl06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0xZnYnLCB0b0Zsb2F0QXJyYXksIDEsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NjRdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMmZ2JywgdG9GbG9hdEFycmF5LCAyLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjY1XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTNmdicsIHRvRmxvYXRBcnJheSwgMywgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY2Nl06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm00ZnYnLCB0b0Zsb2F0QXJyYXksIDQsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbNTEyNF06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0xaXYnLCB0b0ludEFycmF5LCAxLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjY3XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTJpdicsIHRvSW50QXJyYXksIDIsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NjhdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtM2l2JywgdG9JbnRBcnJheSwgMywgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY2OV06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm00aXYnLCB0b0ludEFycmF5LCA0LCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjcwXTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTFpdicsIHRvSW50QXJyYXksIDEsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NzFdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMml2JywgdG9JbnRBcnJheSwgMiwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY3Ml06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0zaXYnLCB0b0ludEFycmF5LCAzLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjczXTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTRpdicsIHRvSW50QXJyYXksIDQsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NzRdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4MmZ2JywgdG9GbG9hdEFycmF5LCA0LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njc1XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDNmdicsIHRvRmxvYXRBcnJheSwgOSwgc2V0TWF0cml4VW5pZm9ybSksXG4gIFszNTY3Nl06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm1NYXRyaXg0ZnYnLCB0b0Zsb2F0QXJyYXksIDE2LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njc4XTogZ2V0U2FtcGxlclNldHRlcixcbiAgWzM1NjgwXTogZ2V0U2FtcGxlclNldHRlcixcbiAgWzUxMjVdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMXVpdicsIHRvVUludEFycmF5LCAxLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM2Mjk0XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTJ1aXYnLCB0b1VJbnRBcnJheSwgMiwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNjI5NV06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0zdWl2JywgdG9VSW50QXJyYXksIDMsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzYyOTZdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtNHVpdicsIHRvVUludEFycmF5LCA0LCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1Njg1XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDJ4M2Z2JywgdG9GbG9hdEFycmF5LCA2LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njg2XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDJ4NGZ2JywgdG9GbG9hdEFycmF5LCA4LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njg3XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDN4MmZ2JywgdG9GbG9hdEFycmF5LCA2LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njg4XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDN4NGZ2JywgdG9GbG9hdEFycmF5LCAxMiwgc2V0TWF0cml4VW5pZm9ybSksXG4gIFszNTY4OV06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm1NYXRyaXg0eDJmdicsIHRvRmxvYXRBcnJheSwgOCwgc2V0TWF0cml4VW5pZm9ybSksXG4gIFszNTY5MF06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm1NYXRyaXg0eDNmdicsIHRvRmxvYXRBcnJheSwgMTIsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2NzhdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzU2ODBdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzU2NzldOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzU2ODJdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYyODldOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYyOTJdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYyOTNdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYyOThdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYyOTldOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMDBdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMDNdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMDZdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMDddOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMDhdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzYzMTFdOiBnZXRTYW1wbGVyU2V0dGVyXG59O1xuY29uc3QgRkxPQVRfQVJSQVkgPSB7fTtcbmNvbnN0IElOVF9BUlJBWSA9IHt9O1xuY29uc3QgVUlOVF9BUlJBWSA9IHt9O1xuY29uc3QgYXJyYXkxID0gWzBdO1xuXG5mdW5jdGlvbiB0b1R5cGVkQXJyYXkodmFsdWUsIHVuaWZvcm1MZW5ndGgsIFR5cGUsIGNhY2hlKSB7XG4gIGlmICh1bmlmb3JtTGVuZ3RoID09PSAxICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA/IDEgOiAwO1xuICB9XG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICBhcnJheTFbMF0gPSB2YWx1ZTtcbiAgICB2YWx1ZSA9IGFycmF5MTtcbiAgfVxuXG4gIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuICBpZiAobGVuZ3RoICUgdW5pZm9ybUxlbmd0aCkge1xuICAgIGxvZy53YXJuKGBVbmlmb3JtIHNpemUgc2hvdWxkIGJlIG11bHRpcGxlcyBvZiAke3VuaWZvcm1MZW5ndGh9YCwgdmFsdWUpKCk7XG4gIH1cblxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgbGV0IHJlc3VsdCA9IGNhY2hlW2xlbmd0aF07XG5cbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXN1bHQgPSBuZXcgVHlwZShsZW5ndGgpO1xuICAgIGNhY2hlW2xlbmd0aF0gPSByZXN1bHQ7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgcmVzdWx0W2ldID0gdmFsdWVbaV07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiB0b0Zsb2F0QXJyYXkodmFsdWUsIHVuaWZvcm1MZW5ndGgpIHtcbiAgcmV0dXJuIHRvVHlwZWRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCwgRmxvYXQzMkFycmF5LCBGTE9BVF9BUlJBWSk7XG59XG5cbmZ1bmN0aW9uIHRvSW50QXJyYXkodmFsdWUsIHVuaWZvcm1MZW5ndGgpIHtcbiAgcmV0dXJuIHRvVHlwZWRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCwgSW50MzJBcnJheSwgSU5UX0FSUkFZKTtcbn1cblxuZnVuY3Rpb24gdG9VSW50QXJyYXkodmFsdWUsIHVuaWZvcm1MZW5ndGgpIHtcbiAgcmV0dXJuIHRvVHlwZWRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCwgVWludDMyQXJyYXksIFVJTlRfQVJSQVkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pZm9ybVNldHRlcihnbCwgbG9jYXRpb24sIGluZm8pIHtcbiAgY29uc3Qgc2V0dGVyID0gVU5JRk9STV9TRVRURVJTW2luZm8udHlwZV07XG5cbiAgaWYgKCFzZXR0ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gR0xTTCB1bmlmb3JtIHR5cGUgJHtpbmZvLnR5cGV9YCk7XG4gIH1cblxuICByZXR1cm4gc2V0dGVyKCkuYmluZChudWxsLCBnbCwgbG9jYXRpb24pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVW5pZm9ybU5hbWUobmFtZSkge1xuICBpZiAobmFtZVtuYW1lLmxlbmd0aCAtIDFdICE9PSAnXScpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGxlbmd0aDogMSxcbiAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IFVOSUZPUk1fTkFNRV9SRUdFWFAgPSAvKFteW10qKShcXFtbMC05XStcXF0pPy87XG4gIGNvbnN0IG1hdGNoZXMgPSBuYW1lLm1hdGNoKFVOSUZPUk1fTkFNRV9SRUdFWFApO1xuXG4gIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBHTFNMIHVuaWZvcm0gbmFtZSAke25hbWV9YCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IG1hdGNoZXNbMV0sXG4gICAgbGVuZ3RoOiBtYXRjaGVzWzJdIHx8IDEsXG4gICAgaXNBcnJheTogQm9vbGVhbihtYXRjaGVzWzJdKVxuICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVW5pZm9ybVZhbHVlcyh1bmlmb3Jtcywgc291cmNlLCB1bmlmb3JtTWFwKSB7XG4gIGZvciAoY29uc3QgdW5pZm9ybU5hbWUgaW4gdW5pZm9ybXMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHVuaWZvcm1zW3VuaWZvcm1OYW1lXTtcbiAgICBjb25zdCBzaG91bGRDaGVjayA9ICF1bmlmb3JtTWFwIHx8IEJvb2xlYW4odW5pZm9ybU1hcFt1bmlmb3JtTmFtZV0pO1xuXG4gICAgaWYgKHNob3VsZENoZWNrICYmICFjaGVja1VuaWZvcm1WYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHNvdXJjZSA9IHNvdXJjZSA/IGAke3NvdXJjZX0gYCA6ICcnO1xuICAgICAgY29uc29sZS5lcnJvcihgJHtzb3VyY2V9IEJhZCB1bmlmb3JtICR7dW5pZm9ybU5hbWV9YCwgdmFsdWUpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvdXJjZX0gQmFkIHVuaWZvcm0gJHt1bmlmb3JtTmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY2hlY2tVbmlmb3JtVmFsdWUodmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gY2hlY2tVbmlmb3JtQXJyYXkodmFsdWUpO1xuICB9XG5cbiAgaWYgKGlzRmluaXRlKHZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGV4dHVyZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVuZGVyYnVmZmVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBGcmFtZWJ1ZmZlcikge1xuICAgIHJldHVybiBCb29sZWFuKHZhbHVlLnRleHR1cmUpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVVuaWZvcm0odW5pZm9ybXMsIGtleSwgdmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICBpZiAodW5pZm9ybXNba2V5XSkge1xuICAgICAgY29uc3QgZGVzdCA9IHVuaWZvcm1zW2tleV07XG5cbiAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBkZXN0W2ldID0gdmFsdWVbaV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuaWZvcm1zW2tleV0gPSB2YWx1ZS5zbGljZSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB1bmlmb3Jtc1trZXldID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tVbmlmb3JtQXJyYXkodmFsdWUpIHtcbiAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGNoZWNrTGVuZ3RoID0gTWF0aC5taW4odmFsdWUubGVuZ3RoLCAxNik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0xlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWVbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGdldFNhbXBsZXJTZXR0ZXIoKSB7XG4gIGxldCBjYWNoZSA9IG51bGw7XG4gIHJldHVybiAoZ2wsIGxvY2F0aW9uLCB2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IHVwZGF0ZSA9IGNhY2hlICE9PSB2YWx1ZTtcblxuICAgIGlmICh1cGRhdGUpIHtcbiAgICAgIGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdmFsdWUpO1xuICAgICAgY2FjaGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXBkYXRlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBcnJheVNldHRlcihmdW5jdGlvbk5hbWUsIHRvQXJyYXksIHNpemUsIHVuaWZvcm1TZXR0ZXIpIHtcbiAgbGV0IGNhY2hlID0gbnVsbDtcbiAgbGV0IGNhY2hlTGVuZ3RoID0gbnVsbDtcbiAgcmV0dXJuIChnbCwgbG9jYXRpb24sIHZhbHVlKSA9PiB7XG4gICAgY29uc3QgYXJyYXlWYWx1ZSA9IHRvQXJyYXkodmFsdWUsIHNpemUpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGFycmF5VmFsdWUubGVuZ3RoO1xuICAgIGxldCB1cGRhdGUgPSBmYWxzZTtcblxuICAgIGlmIChjYWNoZSA9PT0gbnVsbCkge1xuICAgICAgY2FjaGUgPSBuZXcgRmxvYXQzMkFycmF5KGxlbmd0aCk7XG4gICAgICBjYWNoZUxlbmd0aCA9IGxlbmd0aDtcbiAgICAgIHVwZGF0ZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2VydChjYWNoZUxlbmd0aCA9PT0gbGVuZ3RoLCAnVW5pZm9ybSBsZW5ndGggY2Fubm90IGNoYW5nZS4nKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoYXJyYXlWYWx1ZVtpXSAhPT0gY2FjaGVbaV0pIHtcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZSkge1xuICAgICAgdW5pZm9ybVNldHRlcihnbCwgZnVuY3Rpb25OYW1lLCBsb2NhdGlvbiwgYXJyYXlWYWx1ZSk7XG4gICAgICBjYWNoZS5zZXQoYXJyYXlWYWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2V0VmVjdG9yVW5pZm9ybShnbCwgZnVuY3Rpb25OYW1lLCBsb2NhdGlvbiwgdmFsdWUpIHtcbiAgZ2xbZnVuY3Rpb25OYW1lXShsb2NhdGlvbiwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBzZXRNYXRyaXhVbmlmb3JtKGdsLCBmdW5jdGlvbk5hbWUsIGxvY2F0aW9uLCB2YWx1ZSkge1xuICBnbFtmdW5jdGlvbk5hbWVdKGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dW5pZm9ybXMuanMubWFwIiwiaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UnO1xuaW1wb3J0IEJ1ZmZlciBmcm9tICcuL2J1ZmZlcic7XG5pbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgZ2V0U2NyYXRjaEFycmF5LCBmaWxsQXJyYXkgfSBmcm9tICcuLi91dGlscy9hcnJheS11dGlscy1mbGF0JztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBnZXRCcm93c2VyIH0gZnJvbSAncHJvYmUuZ2wnO1xuY29uc3QgRVJSX0VMRU1FTlRTID0gJ2VsZW1lbnRzIG11c3QgYmUgR0wuRUxFTUVOVF9BUlJBWV9CVUZGRVInO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVydGV4QXJyYXlPYmplY3QgZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIHN0YXRpYyBpc1N1cHBvcnRlZChnbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKG9wdGlvbnMuY29uc3RhbnRBdHRyaWJ1dGVaZXJvKSB7XG4gICAgICByZXR1cm4gaXNXZWJHTDIoZ2wpIHx8IGdldEJyb3dzZXIoKSA9PT0gJ0Nocm9tZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVmYXVsdEFycmF5KGdsKSB7XG4gICAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG5cbiAgICBpZiAoIWdsLmx1bWEuZGVmYXVsdFZlcnRleEFycmF5KSB7XG4gICAgICBnbC5sdW1hLmRlZmF1bHRWZXJ0ZXhBcnJheSA9IG5ldyBWZXJ0ZXhBcnJheU9iamVjdChnbCwge1xuICAgICAgICBoYW5kbGU6IG51bGwsXG4gICAgICAgIGlzRGVmYXVsdEFycmF5OiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2wubHVtYS5kZWZhdWx0VmVydGV4QXJyYXk7XG4gIH1cblxuICBzdGF0aWMgZ2V0TWF4QXR0cmlidXRlcyhnbCkge1xuICAgIFZlcnRleEFycmF5T2JqZWN0Lk1BWF9BVFRSSUJVVEVTID0gVmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVMgfHwgZ2wuZ2V0UGFyYW1ldGVyKDM0OTIxKTtcbiAgICByZXR1cm4gVmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVM7XG4gIH1cblxuICBzdGF0aWMgc2V0Q29uc3RhbnQoZ2wsIGxvY2F0aW9uLCBhcnJheSkge1xuICAgIHN3aXRjaCAoYXJyYXkuY29uc3RydWN0b3IpIHtcbiAgICAgIGNhc2UgRmxvYXQzMkFycmF5OlxuICAgICAgICBWZXJ0ZXhBcnJheU9iamVjdC5fc2V0Q29uc3RhbnRGbG9hdEFycmF5KGdsLCBsb2NhdGlvbiwgYXJyYXkpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEludDMyQXJyYXk6XG4gICAgICAgIFZlcnRleEFycmF5T2JqZWN0Ll9zZXRDb25zdGFudEludEFycmF5KGdsLCBsb2NhdGlvbiwgYXJyYXkpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFVpbnQzMkFycmF5OlxuICAgICAgICBWZXJ0ZXhBcnJheU9iamVjdC5fc2V0Q29uc3RhbnRVaW50QXJyYXkoZ2wsIGxvY2F0aW9uLCBhcnJheSk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gb3B0cy5pZCB8fCBvcHRzLnByb2dyYW0gJiYgb3B0cy5wcm9ncmFtLmlkO1xuICAgIHN1cGVyKGdsLCBPYmplY3QuYXNzaWduKHt9LCBvcHRzLCB7XG4gICAgICBpZFxuICAgIH0pKTtcbiAgICB0aGlzLmJ1ZmZlciA9IG51bGw7XG4gICAgdGhpcy5idWZmZXJWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5pc0RlZmF1bHRBcnJheSA9IG9wdHMuaXNEZWZhdWx0QXJyYXkgfHwgZmFsc2U7XG4gICAgdGhpcy5nbDIgPSBnbDtcbiAgICB0aGlzLmluaXRpYWxpemUob3B0cyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgc3VwZXIuZGVsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHRoaXMuYnVmZmVyLmRlbGV0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0IE1BWF9BVFRSSUJVVEVTKCkge1xuICAgIHJldHVybiBWZXJ0ZXhBcnJheU9iamVjdC5nZXRNYXhBdHRyaWJ1dGVzKHRoaXMuZ2wpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShwcm9wcyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UHJvcHMocHJvcHMpO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEVsZW1lbnRCdWZmZXIoZWxlbWVudEJ1ZmZlciA9IG51bGwsIG9wdHMgPSB7fSkge1xuICAgIGFzc2VydCghZWxlbWVudEJ1ZmZlciB8fCBlbGVtZW50QnVmZmVyLnRhcmdldCA9PT0gMzQ5NjMsIEVSUl9FTEVNRU5UUyk7XG4gICAgdGhpcy5iaW5kKCgpID0+IHtcbiAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcigzNDk2MywgZWxlbWVudEJ1ZmZlciA/IGVsZW1lbnRCdWZmZXIuaGFuZGxlIDogbnVsbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRCdWZmZXIobG9jYXRpb24sIGJ1ZmZlciwgYWNjZXNzb3IpIHtcbiAgICBpZiAoYnVmZmVyLnRhcmdldCA9PT0gMzQ5NjMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldEVsZW1lbnRCdWZmZXIoYnVmZmVyLCBhY2Nlc3Nvcik7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgc2l6ZSxcbiAgICAgIHR5cGUsXG4gICAgICBzdHJpZGUsXG4gICAgICBvZmZzZXQsXG4gICAgICBub3JtYWxpemVkLFxuICAgICAgaW50ZWdlcixcbiAgICAgIGRpdmlzb3JcbiAgICB9ID0gYWNjZXNzb3I7XG4gICAgY29uc3Qge1xuICAgICAgZ2wsXG4gICAgICBnbDJcbiAgICB9ID0gdGhpcztcbiAgICBsb2NhdGlvbiA9IE51bWJlcihsb2NhdGlvbik7XG4gICAgdGhpcy5iaW5kKCgpID0+IHtcbiAgICAgIGdsLmJpbmRCdWZmZXIoMzQ5NjIsIGJ1ZmZlci5oYW5kbGUpO1xuXG4gICAgICBpZiAoaW50ZWdlcikge1xuICAgICAgICBhc3NlcnQoaXNXZWJHTDIoZ2wpKTtcbiAgICAgICAgZ2wyLnZlcnRleEF0dHJpYklQb2ludGVyKGxvY2F0aW9uLCBzaXplLCB0eXBlLCBzdHJpZGUsIG9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCBzaXplLCB0eXBlLCBub3JtYWxpemVkLCBzdHJpZGUsIG9mZnNldCk7XG4gICAgICB9XG5cbiAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgIGdsMi52ZXJ0ZXhBdHRyaWJEaXZpc29yKGxvY2F0aW9uLCBkaXZpc29yIHx8IDApO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW5hYmxlKGxvY2F0aW9uLCBlbmFibGUgPSB0cnVlKSB7XG4gICAgY29uc3QgZGlzYWJsaW5nQXR0cmlidXRlWmVybyA9ICFlbmFibGUgJiYgbG9jYXRpb24gPT09IDAgJiYgIVZlcnRleEFycmF5T2JqZWN0LmlzU3VwcG9ydGVkKHRoaXMuZ2wsIHtcbiAgICAgIGNvbnN0YW50QXR0cmlidXRlWmVybzogdHJ1ZVxuICAgIH0pO1xuXG4gICAgaWYgKCFkaXNhYmxpbmdBdHRyaWJ1dGVaZXJvKSB7XG4gICAgICBsb2NhdGlvbiA9IE51bWJlcihsb2NhdGlvbik7XG4gICAgICB0aGlzLmJpbmQoKCkgPT4gZW5hYmxlID8gdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbikgOiB0aGlzLmdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbikpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0Q29uc3RhbnRCdWZmZXIoZWxlbWVudENvdW50LCB2YWx1ZSkge1xuICAgIGNvbnN0IGNvbnN0YW50VmFsdWUgPSB0aGlzLl9ub3JtYWxpemVDb25zdGFudEFycmF5VmFsdWUodmFsdWUpO1xuXG4gICAgY29uc3QgYnl0ZUxlbmd0aCA9IGNvbnN0YW50VmFsdWUuYnl0ZUxlbmd0aCAqIGVsZW1lbnRDb3VudDtcbiAgICBjb25zdCBsZW5ndGggPSBjb25zdGFudFZhbHVlLmxlbmd0aCAqIGVsZW1lbnRDb3VudDtcbiAgICBsZXQgdXBkYXRlTmVlZGVkID0gIXRoaXMuYnVmZmVyO1xuICAgIHRoaXMuYnVmZmVyID0gdGhpcy5idWZmZXIgfHwgbmV3IEJ1ZmZlcih0aGlzLmdsLCBieXRlTGVuZ3RoKTtcbiAgICB1cGRhdGVOZWVkZWQgPSB1cGRhdGVOZWVkZWQgfHwgdGhpcy5idWZmZXIucmVhbGxvY2F0ZShieXRlTGVuZ3RoKTtcbiAgICB1cGRhdGVOZWVkZWQgPSB1cGRhdGVOZWVkZWQgfHwgIXRoaXMuX2NvbXBhcmVDb25zdGFudEFycmF5VmFsdWVzKGNvbnN0YW50VmFsdWUsIHRoaXMuYnVmZmVyVmFsdWUpO1xuXG4gICAgaWYgKHVwZGF0ZU5lZWRlZCkge1xuICAgICAgY29uc3QgdHlwZWRBcnJheSA9IGdldFNjcmF0Y2hBcnJheSh2YWx1ZS5jb25zdHJ1Y3RvciwgbGVuZ3RoKTtcbiAgICAgIGZpbGxBcnJheSh7XG4gICAgICAgIHRhcmdldDogdHlwZWRBcnJheSxcbiAgICAgICAgc291cmNlOiBjb25zdGFudFZhbHVlLFxuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgY291bnQ6IGxlbmd0aFxuICAgICAgfSk7XG4gICAgICB0aGlzLmJ1ZmZlci5zdWJEYXRhKHR5cGVkQXJyYXkpO1xuICAgICAgdGhpcy5idWZmZXJWYWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJ1ZmZlcjtcbiAgfVxuXG4gIF9ub3JtYWxpemVDb25zdGFudEFycmF5VmFsdWUoYXJyYXlWYWx1ZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycmF5VmFsdWUpKSB7XG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShhcnJheVZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXlWYWx1ZTtcbiAgfVxuXG4gIF9jb21wYXJlQ29uc3RhbnRBcnJheVZhbHVlcyh2MSwgdjIpIHtcbiAgICBpZiAoIXYxIHx8ICF2MiB8fCB2MS5sZW5ndGggIT09IHYyLmxlbmd0aCB8fCB2MS5jb25zdHJ1Y3RvciAhPT0gdjIuY29uc3RydWN0b3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHYxLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodjFbaV0gIT09IHYyW2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBfc2V0Q29uc3RhbnRGbG9hdEFycmF5KGdsLCBsb2NhdGlvbiwgYXJyYXkpIHtcbiAgICBzd2l0Y2ggKGFycmF5Lmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWIxZnYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZ2wudmVydGV4QXR0cmliMmZ2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYjNmdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0OlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWI0ZnYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIF9zZXRDb25zdGFudEludEFycmF5KGdsLCBsb2NhdGlvbiwgYXJyYXkpIHtcbiAgICBhc3NlcnQoaXNXZWJHTDIoZ2wpKTtcblxuICAgIHN3aXRjaCAoYXJyYXkubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkkxaXYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZ2wudmVydGV4QXR0cmliSTJpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJM2l2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkk0aXYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIF9zZXRDb25zdGFudFVpbnRBcnJheShnbCwgbG9jYXRpb24sIGFycmF5KSB7XG4gICAgYXNzZXJ0KGlzV2ViR0wyKGdsKSk7XG5cbiAgICBzd2l0Y2ggKGFycmF5Lmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJMXVpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJMnVpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJM3Vpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0OlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJNHVpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIGNvbnN0IGdsMiA9IHRoaXMuZ2w7XG4gICAgcmV0dXJuIGdsMi5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZShoYW5kbGUpIHtcbiAgICB0aGlzLmdsMi5kZWxldGVWZXJ0ZXhBcnJheShoYW5kbGUpO1xuICAgIHJldHVybiBbdGhpcy5lbGVtZW50c107XG4gIH1cblxuICBfYmluZEhhbmRsZShoYW5kbGUpIHtcbiAgICB0aGlzLmdsMi5iaW5kVmVydGV4QXJyYXkoaGFuZGxlKTtcbiAgfVxuXG4gIF9nZXRQYXJhbWV0ZXIocG5hbWUsIHtcbiAgICBsb2NhdGlvblxuICB9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsb2NhdGlvbikpO1xuICAgIHJldHVybiB0aGlzLmJpbmQoKCkgPT4ge1xuICAgICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgICBjYXNlIDM0MzczOlxuICAgICAgICAgIHJldHVybiB0aGlzLmdsLmdldFZlcnRleEF0dHJpYk9mZnNldChsb2NhdGlvbiwgcG5hbWUpO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2wuZ2V0VmVydGV4QXR0cmliKGxvY2F0aW9uLCBwbmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmVydGV4LWFycmF5LW9iamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCBBY2Nlc3NvciBmcm9tICcuL2FjY2Vzc29yJztcbmltcG9ydCBCdWZmZXIgZnJvbSAnLi9idWZmZXInO1xuaW1wb3J0IFZlcnRleEFycmF5T2JqZWN0IGZyb20gJy4vdmVydGV4LWFycmF5LW9iamVjdCc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgc3R1YlJlbW92ZWRNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvc3R1Yi1tZXRob2RzJztcbmNvbnN0IEVSUl9BVFRSSUJVVEVfVFlQRSA9ICdWZXJ0ZXhBcnJheTogYXR0cmlidXRlcyBtdXN0IGJlIEJ1ZmZlcnMgb3IgY29uc3RhbnRzIChpLmUuIHR5cGVkIGFycmF5KSc7XG5jb25zdCBNVUxUSV9MT0NBVElPTl9BVFRSSUJVVEVfUkVHRVhQID0gL14oLispX19MT0NBVElPTl8oWzAtOV0rKSQvO1xuY29uc3QgREVQUkVDQVRJT05TX1Y2ID0gWydzZXRCdWZmZXJzJywgJ3NldEdlbmVyaWMnLCAnY2xlYXJCaW5kaW5ncycsICdzZXRMb2NhdGlvbnMnLCAnc2V0R2VuZXJpY1ZhbHVlcycsICdzZXREaXZpc29yJywgJ2VuYWJsZScsICdkaXNhYmxlJ107XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJ0ZXhBcnJheSB7XG4gIGNvbnN0cnVjdG9yKGdsLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBpZCA9IG9wdHMuaWQgfHwgb3B0cy5wcm9ncmFtICYmIG9wdHMucHJvZ3JhbS5pZDtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50c0FjY2Vzc29yID0gbnVsbDtcbiAgICB0aGlzLnZhbHVlcyA9IG51bGw7XG4gICAgdGhpcy5hY2Nlc3NvcnMgPSBudWxsO1xuICAgIHRoaXMudW51c2VkID0gbnVsbDtcbiAgICB0aGlzLmRyYXdQYXJhbXMgPSBudWxsO1xuICAgIHRoaXMuYnVmZmVyID0gbnVsbDtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0ID0gbmV3IFZlcnRleEFycmF5T2JqZWN0KGdsKTtcbiAgICBzdHViUmVtb3ZlZE1ldGhvZHModGhpcywgJ1ZlcnRleEFycmF5JywgJ3Y2LjAnLCBERVBSRUNBVElPTlNfVjYpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHRoaXMuYnVmZmVyLmRlbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuZGVsZXRlKCk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5jb25maWd1cmF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmJpbmRPblVzZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzLnNldFByb3BzKHByb3BzKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudHNBY2Nlc3NvciA9IG51bGw7XG4gICAgY29uc3Qge1xuICAgICAgTUFYX0FUVFJJQlVURVNcbiAgICB9ID0gdGhpcy52ZXJ0ZXhBcnJheU9iamVjdDtcbiAgICB0aGlzLnZhbHVlcyA9IG5ldyBBcnJheShNQVhfQVRUUklCVVRFUykuZmlsbChudWxsKTtcbiAgICB0aGlzLmFjY2Vzc29ycyA9IG5ldyBBcnJheShNQVhfQVRUUklCVVRFUykuZmlsbChudWxsKTtcbiAgICB0aGlzLnVudXNlZCA9IHt9O1xuICAgIHRoaXMuZHJhd1BhcmFtcyA9IG51bGw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICgncHJvZ3JhbScgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IHByb3BzLnByb2dyYW0gJiYgcHJvcHMucHJvZ3JhbS5jb25maWd1cmF0aW9uO1xuICAgIH1cblxuICAgIGlmICgnY29uZmlndXJhdGlvbicgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IHByb3BzLmNvbmZpZ3VyYXRpb247XG4gICAgfVxuXG4gICAgaWYgKCdhdHRyaWJ1dGVzJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVzKHByb3BzLmF0dHJpYnV0ZXMpO1xuICAgIH1cblxuICAgIGlmICgnZWxlbWVudHMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEVsZW1lbnRCdWZmZXIocHJvcHMuZWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmICgnYmluZE9uVXNlJyBpbiBwcm9wcykge1xuICAgICAgcHJvcHMgPSBwcm9wcy5iaW5kT25Vc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjbGVhckRyYXdQYXJhbXMoKSB7XG4gICAgdGhpcy5kcmF3UGFyYW1zID0gbnVsbDtcbiAgfVxuXG4gIGdldERyYXdQYXJhbXMoKSB7XG4gICAgdGhpcy5kcmF3UGFyYW1zID0gdGhpcy5kcmF3UGFyYW1zIHx8IHRoaXMuX3VwZGF0ZURyYXdQYXJhbXMoKTtcbiAgICByZXR1cm4gdGhpcy5kcmF3UGFyYW1zO1xuICB9XG5cbiAgc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMpO1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuYmluZCgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGxvY2F0aW9uT3JOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2xvY2F0aW9uT3JOYW1lXTtcblxuICAgICAgICB0aGlzLl9zZXRBdHRyaWJ1dGUobG9jYXRpb25Pck5hbWUsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKDM0OTYyLCBudWxsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEVsZW1lbnRCdWZmZXIoZWxlbWVudEJ1ZmZlciA9IG51bGwsIGFjY2Vzc29yID0ge30pIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudEJ1ZmZlcjtcbiAgICB0aGlzLmVsZW1lbnRzQWNjZXNzb3IgPSBhY2Nlc3NvcjtcbiAgICB0aGlzLmNsZWFyRHJhd1BhcmFtcygpO1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3Quc2V0RWxlbWVudEJ1ZmZlcihlbGVtZW50QnVmZmVyLCBhY2Nlc3Nvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRCdWZmZXIobG9jYXRpb25Pck5hbWUsIGJ1ZmZlciwgYXBwQWNjZXNzb3IgPSB7fSkge1xuICAgIGlmIChidWZmZXIudGFyZ2V0ID09PSAzNDk2Mykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0RWxlbWVudEJ1ZmZlcihidWZmZXIsIGFwcEFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBsb2NhdGlvbixcbiAgICAgIGFjY2Vzc29yXG4gICAgfSA9IHRoaXMuX3Jlc29sdmVMb2NhdGlvbkFuZEFjY2Vzc29yKGxvY2F0aW9uT3JOYW1lLCBidWZmZXIsIGJ1ZmZlci5hY2Nlc3NvciwgYXBwQWNjZXNzb3IpO1xuXG4gICAgaWYgKGxvY2F0aW9uID49IDApIHtcbiAgICAgIHRoaXMudmFsdWVzW2xvY2F0aW9uXSA9IGJ1ZmZlcjtcbiAgICAgIHRoaXMuYWNjZXNzb3JzW2xvY2F0aW9uXSA9IGFjY2Vzc29yO1xuICAgICAgdGhpcy5jbGVhckRyYXdQYXJhbXMoKTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3Quc2V0QnVmZmVyKGxvY2F0aW9uLCBidWZmZXIsIGFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldENvbnN0YW50KGxvY2F0aW9uT3JOYW1lLCBhcnJheVZhbHVlLCBhcHBBY2Nlc3NvciA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgbG9jYXRpb24sXG4gICAgICBhY2Nlc3NvclxuICAgIH0gPSB0aGlzLl9yZXNvbHZlTG9jYXRpb25BbmRBY2Nlc3Nvcihsb2NhdGlvbk9yTmFtZSwgYXJyYXlWYWx1ZSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICBzaXplOiBhcnJheVZhbHVlLmxlbmd0aFxuICAgIH0sIGFwcEFjY2Vzc29yKSk7XG5cbiAgICBpZiAobG9jYXRpb24gPj0gMCkge1xuICAgICAgYXJyYXlWYWx1ZSA9IHRoaXMudmVydGV4QXJyYXlPYmplY3QuX25vcm1hbGl6ZUNvbnN0YW50QXJyYXlWYWx1ZShhcnJheVZhbHVlKTtcbiAgICAgIHRoaXMudmFsdWVzW2xvY2F0aW9uXSA9IGFycmF5VmFsdWU7XG4gICAgICB0aGlzLmFjY2Vzc29yc1tsb2NhdGlvbl0gPSBhY2Nlc3NvcjtcbiAgICAgIHRoaXMuY2xlYXJEcmF3UGFyYW1zKCk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LmVuYWJsZShsb2NhdGlvbiwgZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdW5iaW5kQnVmZmVycygpIHtcbiAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LmJpbmQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudHMpIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5zZXRFbGVtZW50QnVmZmVyKG51bGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyIHx8IG5ldyBCdWZmZXIodGhpcy5nbCwge1xuICAgICAgICBhY2Nlc3Nvcjoge1xuICAgICAgICAgIHNpemU6IDRcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGxvY2F0aW9uID0gMDsgbG9jYXRpb24gPCB0aGlzLnZlcnRleEFycmF5T2JqZWN0Lk1BWF9BVFRSSUJVVEVTOyBsb2NhdGlvbisrKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlc1tsb2NhdGlvbl0gaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICB0aGlzLmdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKDM0OTYyLCB0aGlzLmJ1ZmZlci5oYW5kbGUpO1xuICAgICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgMSwgNTEyNiwgZmFsc2UsIDAsIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBiaW5kQnVmZmVycygpIHtcbiAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LmJpbmQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudHMpIHtcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50QnVmZmVyKHRoaXMuZWxlbWVudHMpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBsb2NhdGlvbiA9IDA7IGxvY2F0aW9uIDwgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5NQVhfQVRUUklCVVRFUzsgbG9jYXRpb24rKykge1xuICAgICAgICBjb25zdCBidWZmZXIgPSB0aGlzLnZhbHVlc1tsb2NhdGlvbl07XG5cbiAgICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgIHRoaXMuc2V0QnVmZmVyKGxvY2F0aW9uLCBidWZmZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBiaW5kRm9yRHJhdyh2ZXJ0ZXhDb3VudCwgaW5zdGFuY2VDb3VudCwgZnVuYykge1xuICAgIGxldCB2YWx1ZTtcbiAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LmJpbmQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29uc3RhbnRBdHRyaWJ1dGVzKHZlcnRleENvdW50LCBpbnN0YW5jZUNvdW50KTtcblxuICAgICAgdmFsdWUgPSBmdW5jKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgX3Jlc29sdmVMb2NhdGlvbkFuZEFjY2Vzc29yKGxvY2F0aW9uT3JOYW1lLCB2YWx1ZSwgdmFsdWVBY2Nlc3NvciwgYXBwQWNjZXNzb3IpIHtcbiAgICBjb25zdCBJTlZBTElEX1JFU1VMVCA9IHtcbiAgICAgIGxvY2F0aW9uOiAtMSxcbiAgICAgIGFjY2Vzc29yOiBudWxsXG4gICAgfTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgbmFtZVxuICAgIH0gPSB0aGlzLl9nZXRBdHRyaWJ1dGVJbmRleChsb2NhdGlvbk9yTmFtZSk7XG5cbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShsb2NhdGlvbikgfHwgbG9jYXRpb24gPCAwKSB7XG4gICAgICB0aGlzLnVudXNlZFtsb2NhdGlvbk9yTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGxvZy5vbmNlKDMsICgpID0+IGB1bnVzZWQgdmFsdWUgJHtsb2NhdGlvbk9yTmFtZX0gaW4gJHt0aGlzLmlkfWApKCk7XG4gICAgICByZXR1cm4gSU5WQUxJRF9SRVNVTFQ7XG4gICAgfVxuXG4gICAgY29uc3QgYWNjZXNzSW5mbyA9IHRoaXMuX2dldEF0dHJpYnV0ZUluZm8obmFtZSB8fCBsb2NhdGlvbik7XG5cbiAgICBpZiAoIWFjY2Vzc0luZm8pIHtcbiAgICAgIHJldHVybiBJTlZBTElEX1JFU1VMVDtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50QWNjZXNzb3IgPSB0aGlzLmFjY2Vzc29yc1tsb2NhdGlvbl0gfHwge307XG4gICAgY29uc3QgYWNjZXNzb3IgPSBBY2Nlc3Nvci5yZXNvbHZlKGFjY2Vzc0luZm8uYWNjZXNzb3IsIGN1cnJlbnRBY2Nlc3NvciwgdmFsdWVBY2Nlc3NvciwgYXBwQWNjZXNzb3IpO1xuICAgIGNvbnN0IHtcbiAgICAgIHNpemUsXG4gICAgICB0eXBlXG4gICAgfSA9IGFjY2Vzc29yO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoc2l6ZSkgJiYgTnVtYmVyLmlzRmluaXRlKHR5cGUpKTtcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYXRpb24sXG4gICAgICBhY2Nlc3NvclxuICAgIH07XG4gIH1cblxuICBfZ2V0QXR0cmlidXRlSW5mbyhhdHRyaWJ1dGVOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbiAmJiB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0QXR0cmlidXRlSW5mbyhhdHRyaWJ1dGVOYW1lKTtcbiAgfVxuXG4gIF9nZXRBdHRyaWJ1dGVJbmRleChsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uT3JOYW1lKTtcblxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsb2NhdGlvblxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBtdWx0aUxvY2F0aW9uID0gTVVMVElfTE9DQVRJT05fQVRUUklCVVRFX1JFR0VYUC5leGVjKGxvY2F0aW9uT3JOYW1lKTtcbiAgICBjb25zdCBuYW1lID0gbXVsdGlMb2NhdGlvbiA/IG11bHRpTG9jYXRpb25bMV0gOiBsb2NhdGlvbk9yTmFtZTtcbiAgICBjb25zdCBsb2NhdGlvbk9mZnNldCA9IG11bHRpTG9jYXRpb24gPyBOdW1iZXIobXVsdGlMb2NhdGlvblsyXSkgOiAwO1xuXG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbG9jYXRpb246IHRoaXMuY29uZmlndXJhdGlvbi5nZXRBdHRyaWJ1dGVMb2NhdGlvbihuYW1lKSArIGxvY2F0aW9uT2Zmc2V0LFxuICAgICAgICBuYW1lXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogLTFcbiAgICB9O1xuICB9XG5cbiAgX3NldEF0dHJpYnV0ZShsb2NhdGlvbk9yTmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMuc2V0QnVmZmVyKGxvY2F0aW9uT3JOYW1lLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggJiYgdmFsdWVbMF0gaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHZhbHVlWzBdO1xuICAgICAgY29uc3QgYWNjZXNzb3IgPSB2YWx1ZVsxXTtcbiAgICAgIHRoaXMuc2V0QnVmZmVyKGxvY2F0aW9uT3JOYW1lLCBidWZmZXIsIGFjY2Vzc29yKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IGNvbnN0YW50ID0gdmFsdWU7XG4gICAgICB0aGlzLnNldENvbnN0YW50KGxvY2F0aW9uT3JOYW1lLCBjb25zdGFudCk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5idWZmZXIgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIGNvbnN0IGFjY2Vzc29yID0gdmFsdWU7XG4gICAgICB0aGlzLnNldEJ1ZmZlcihsb2NhdGlvbk9yTmFtZSwgYWNjZXNzb3IuYnVmZmVyLCBhY2Nlc3Nvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihFUlJfQVRUUklCVVRFX1RZUEUpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRDb25zdGFudEF0dHJpYnV0ZXModmVydGV4Q291bnQsIGluc3RhbmNlQ291bnQpIHtcbiAgICBjb25zdCBlbGVtZW50Q291bnQgPSBNYXRoLm1heCh2ZXJ0ZXhDb3VudCB8IDAsIGluc3RhbmNlQ291bnQgfCAwKTtcbiAgICBsZXQgY29uc3RhbnQgPSB0aGlzLnZhbHVlc1swXTtcblxuICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoY29uc3RhbnQpKSB7XG4gICAgICB0aGlzLl9zZXRDb25zdGFudEF0dHJpYnV0ZVplcm8oY29uc3RhbnQsIGVsZW1lbnRDb3VudCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgbG9jYXRpb24gPSAxOyBsb2NhdGlvbiA8IHRoaXMudmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVM7IGxvY2F0aW9uKyspIHtcbiAgICAgIGNvbnN0YW50ID0gdGhpcy52YWx1ZXNbbG9jYXRpb25dO1xuXG4gICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGNvbnN0YW50KSkge1xuICAgICAgICB0aGlzLl9zZXRDb25zdGFudEF0dHJpYnV0ZShsb2NhdGlvbiwgY29uc3RhbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9zZXRDb25zdGFudEF0dHJpYnV0ZVplcm8oY29uc3RhbnQsIGVsZW1lbnRDb3VudCkge1xuICAgIGlmIChWZXJ0ZXhBcnJheU9iamVjdC5pc1N1cHBvcnRlZCh0aGlzLmdsLCB7XG4gICAgICBjb25zdGFudEF0dHJpYnV0ZVplcm86IHRydWVcbiAgICB9KSkge1xuICAgICAgdGhpcy5fc2V0Q29uc3RhbnRBdHRyaWJ1dGUoMCwgY29uc3RhbnQpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5nZXRDb25zdGFudEJ1ZmZlcihlbGVtZW50Q291bnQsIGNvbnN0YW50KTtcbiAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LnNldEJ1ZmZlcigwLCBidWZmZXIsIHRoaXMuYWNjZXNzb3JzWzBdKTtcbiAgfVxuXG4gIF9zZXRDb25zdGFudEF0dHJpYnV0ZShsb2NhdGlvbiwgY29uc3RhbnQpIHtcbiAgICBWZXJ0ZXhBcnJheU9iamVjdC5zZXRDb25zdGFudCh0aGlzLmdsLCBsb2NhdGlvbiwgY29uc3RhbnQpO1xuICB9XG5cbiAgX3VwZGF0ZURyYXdQYXJhbXMoKSB7XG4gICAgY29uc3QgZHJhd1BhcmFtcyA9IHtcbiAgICAgIGlzSW5kZXhlZDogZmFsc2UsXG4gICAgICBpc0luc3RhbmNlZDogZmFsc2UsXG4gICAgICBpbmRleENvdW50OiBJbmZpbml0eSxcbiAgICAgIHZlcnRleENvdW50OiBJbmZpbml0eSxcbiAgICAgIGluc3RhbmNlQ291bnQ6IEluZmluaXR5XG4gICAgfTtcblxuICAgIGZvciAobGV0IGxvY2F0aW9uID0gMDsgbG9jYXRpb24gPCB0aGlzLnZlcnRleEFycmF5T2JqZWN0Lk1BWF9BVFRSSUJVVEVTOyBsb2NhdGlvbisrKSB7XG4gICAgICB0aGlzLl91cGRhdGVEcmF3UGFyYW1zRm9yTG9jYXRpb24oZHJhd1BhcmFtcywgbG9jYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBkcmF3UGFyYW1zLmVsZW1lbnRDb3VudCA9IHRoaXMuZWxlbWVudHMuZ2V0RWxlbWVudENvdW50KHRoaXMuZWxlbWVudHMuYWNjZXNzb3IpO1xuICAgICAgZHJhd1BhcmFtcy5pc0luZGV4ZWQgPSB0cnVlO1xuICAgICAgZHJhd1BhcmFtcy5pbmRleFR5cGUgPSB0aGlzLmVsZW1lbnRzQWNjZXNzb3IudHlwZSB8fCB0aGlzLmVsZW1lbnRzLmFjY2Vzc29yLnR5cGU7XG4gICAgICBkcmF3UGFyYW1zLmluZGV4T2Zmc2V0ID0gdGhpcy5lbGVtZW50c0FjY2Vzc29yLm9mZnNldCB8fCAwO1xuICAgIH1cblxuICAgIGlmIChkcmF3UGFyYW1zLmluZGV4Q291bnQgPT09IEluZmluaXR5KSB7XG4gICAgICBkcmF3UGFyYW1zLmluZGV4Q291bnQgPSAwO1xuICAgIH1cblxuICAgIGlmIChkcmF3UGFyYW1zLnZlcnRleENvdW50ID09PSBJbmZpbml0eSkge1xuICAgICAgZHJhd1BhcmFtcy52ZXJ0ZXhDb3VudCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGRyYXdQYXJhbXMuaW5zdGFuY2VDb3VudCA9PT0gSW5maW5pdHkpIHtcbiAgICAgIGRyYXdQYXJhbXMuaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRyYXdQYXJhbXM7XG4gIH1cblxuICBfdXBkYXRlRHJhd1BhcmFtc0ZvckxvY2F0aW9uKGRyYXdQYXJhbXMsIGxvY2F0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlc1tsb2NhdGlvbl07XG4gICAgY29uc3QgYWNjZXNzb3IgPSB0aGlzLmFjY2Vzc29yc1tsb2NhdGlvbl07XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZGl2aXNvclxuICAgIH0gPSBhY2Nlc3NvcjtcbiAgICBjb25zdCBpc0luc3RhbmNlZCA9IGRpdmlzb3IgPiAwO1xuICAgIGRyYXdQYXJhbXMuaXNJbnN0YW5jZWQgPSBkcmF3UGFyYW1zLmlzSW5zdGFuY2VkIHx8IGlzSW5zdGFuY2VkO1xuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSB2YWx1ZTtcblxuICAgICAgaWYgKGlzSW5zdGFuY2VkKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlQ291bnQgPSBidWZmZXIuZ2V0VmVydGV4Q291bnQoYWNjZXNzb3IpO1xuICAgICAgICBkcmF3UGFyYW1zLmluc3RhbmNlQ291bnQgPSBNYXRoLm1pbihkcmF3UGFyYW1zLmluc3RhbmNlQ291bnQsIGluc3RhbmNlQ291bnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmVydGV4Q291bnQgPSBidWZmZXIuZ2V0VmVydGV4Q291bnQoYWNjZXNzb3IpO1xuICAgICAgICBkcmF3UGFyYW1zLnZlcnRleENvdW50ID0gTWF0aC5taW4oZHJhd1BhcmFtcy52ZXJ0ZXhDb3VudCwgdmVydGV4Q291bnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEVsZW1lbnRzKGVsZW1lbnRCdWZmZXIgPSBudWxsLCBhY2Nlc3NvciA9IHt9KSB7XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ3NldEVsZW1lbnRzJywgJ3NldEVsZW1lbnRCdWZmZXInKSgpO1xuICAgIHJldHVybiB0aGlzLnNldEVsZW1lbnRCdWZmZXIoZWxlbWVudEJ1ZmZlciwgYWNjZXNzb3IpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZlcnRleC1hcnJheS5qcy5tYXAiLCJpbXBvcnQgeyBnZXRDb21wb3NpdGVHTFR5cGUgfSBmcm9tICcuLi93ZWJnbC11dGlscy9hdHRyaWJ1dGUtdXRpbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlYnVnVGFibGVGb3JQcm9ncmFtQ29uZmlndXJhdGlvbihjb25maWcpIHtcbiAgY29uc3QgdGFibGUgPSB7fTtcbiAgY29uc3QgaGVhZGVyID0gYEFjY2Vzc29ycyBmb3IgJHtjb25maWcuaWR9YDtcblxuICBmb3IgKGNvbnN0IGF0dHJpYnV0ZUluZm8gb2YgY29uZmlnLmF0dHJpYnV0ZUluZm9zKSB7XG4gICAgaWYgKGF0dHJpYnV0ZUluZm8pIHtcbiAgICAgIGNvbnN0IGdsc2xEZWNsYXJhdGlvbiA9IGdldEdMU0xEZWNsYXJhdGlvbihhdHRyaWJ1dGVJbmZvKTtcbiAgICAgIHRhYmxlW2BpbiAke2dsc2xEZWNsYXJhdGlvbn1gXSA9IHtcbiAgICAgICAgW2hlYWRlcl06IEpTT04uc3RyaW5naWZ5KGF0dHJpYnV0ZUluZm8uYWNjZXNzb3IpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdmFyeWluZ0luZm8gb2YgY29uZmlnLnZhcnlpbmdJbmZvcykge1xuICAgIGlmICh2YXJ5aW5nSW5mbykge1xuICAgICAgY29uc3QgZ2xzbERlY2xhcmF0aW9uID0gZ2V0R0xTTERlY2xhcmF0aW9uKHZhcnlpbmdJbmZvKTtcbiAgICAgIHRhYmxlW2BvdXQgJHtnbHNsRGVjbGFyYXRpb259YF0gPSB7XG4gICAgICAgIFtoZWFkZXJdOiBKU09OLnN0cmluZ2lmeSh2YXJ5aW5nSW5mby5hY2Nlc3NvcilcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufVxuXG5mdW5jdGlvbiBnZXRHTFNMRGVjbGFyYXRpb24oYXR0cmlidXRlSW5mbykge1xuICBjb25zdCB7XG4gICAgdHlwZSxcbiAgICBzaXplXG4gIH0gPSBhdHRyaWJ1dGVJbmZvLmFjY2Vzc29yO1xuICBjb25zdCB0eXBlQW5kTmFtZSA9IGdldENvbXBvc2l0ZUdMVHlwZSh0eXBlLCBzaXplKTtcblxuICBpZiAodHlwZUFuZE5hbWUpIHtcbiAgICByZXR1cm4gYCR7dHlwZUFuZE5hbWUubmFtZX0gJHthdHRyaWJ1dGVJbmZvLm5hbWV9YDtcbiAgfVxuXG4gIHJldHVybiBhdHRyaWJ1dGVJbmZvLm5hbWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWJ1Zy1wcm9ncmFtLWNvbmZpZ3VyYXRpb24uanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGZvcm1hdFZhbHVlIH0gZnJvbSAnLi4vdXRpbHMvZm9ybWF0LXZhbHVlJztcbmV4cG9ydCBmdW5jdGlvbiBnZXREZWJ1Z1RhYmxlRm9yVW5pZm9ybXMoe1xuICBoZWFkZXIgPSAnVW5pZm9ybXMnLFxuICBwcm9ncmFtLFxuICB1bmlmb3JtcyxcbiAgdW5kZWZpbmVkT25seSA9IGZhbHNlXG59KSB7XG4gIGFzc2VydChwcm9ncmFtKTtcbiAgY29uc3QgU0hBREVSX01PRFVMRV9VTklGT1JNX1JFR0VYUCA9ICcuKl8uKic7XG4gIGNvbnN0IFBST0pFQ1RfTU9EVUxFX1VOSUZPUk1fUkVHRVhQID0gJy4qTWF0cml4JztcbiAgY29uc3QgdW5pZm9ybUxvY2F0aW9ucyA9IHByb2dyYW0uX3VuaWZvcm1TZXR0ZXJzO1xuICBjb25zdCB0YWJsZSA9IHt9O1xuICBjb25zdCB1bmlmb3JtTmFtZXMgPSBPYmplY3Qua2V5cyh1bmlmb3JtTG9jYXRpb25zKS5zb3J0KCk7XG4gIGxldCBjb3VudCA9IDA7XG5cbiAgZm9yIChjb25zdCB1bmlmb3JtTmFtZSBvZiB1bmlmb3JtTmFtZXMpIHtcbiAgICBpZiAoIXVuaWZvcm1OYW1lLm1hdGNoKFNIQURFUl9NT0RVTEVfVU5JRk9STV9SRUdFWFApICYmICF1bmlmb3JtTmFtZS5tYXRjaChQUk9KRUNUX01PRFVMRV9VTklGT1JNX1JFR0VYUCkpIHtcbiAgICAgIGlmIChhZGRVbmlmb3JtVG9UYWJsZSh7XG4gICAgICAgIHRhYmxlLFxuICAgICAgICBoZWFkZXIsXG4gICAgICAgIHVuaWZvcm1zLFxuICAgICAgICB1bmlmb3JtTmFtZSxcbiAgICAgICAgdW5kZWZpbmVkT25seVxuICAgICAgfSkpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIG9mIHVuaWZvcm1OYW1lcykge1xuICAgIGlmICh1bmlmb3JtTmFtZS5tYXRjaChQUk9KRUNUX01PRFVMRV9VTklGT1JNX1JFR0VYUCkpIHtcbiAgICAgIGlmIChhZGRVbmlmb3JtVG9UYWJsZSh7XG4gICAgICAgIHRhYmxlLFxuICAgICAgICBoZWFkZXIsXG4gICAgICAgIHVuaWZvcm1zLFxuICAgICAgICB1bmlmb3JtTmFtZSxcbiAgICAgICAgdW5kZWZpbmVkT25seVxuICAgICAgfSkpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIG9mIHVuaWZvcm1OYW1lcykge1xuICAgIGlmICghdGFibGVbdW5pZm9ybU5hbWVdKSB7XG4gICAgICBpZiAoYWRkVW5pZm9ybVRvVGFibGUoe1xuICAgICAgICB0YWJsZSxcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgdW5pZm9ybU5hbWUsXG4gICAgICAgIHVuZGVmaW5lZE9ubHlcbiAgICAgIH0pKSB7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IHVudXNlZENvdW50ID0gMDtcbiAgY29uc3QgdW51c2VkVGFibGUgPSB7fTtcblxuICBpZiAoIXVuZGVmaW5lZE9ubHkpIHtcbiAgICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIGluIHVuaWZvcm1zKSB7XG4gICAgICBjb25zdCB1bmlmb3JtID0gdW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuXG4gICAgICBpZiAoIXRhYmxlW3VuaWZvcm1OYW1lXSkge1xuICAgICAgICB1bnVzZWRDb3VudCsrO1xuICAgICAgICB1bnVzZWRUYWJsZVt1bmlmb3JtTmFtZV0gPSB7XG4gICAgICAgICAgVHlwZTogYE5PVCBVU0VEOiAke3VuaWZvcm19YCxcbiAgICAgICAgICBbaGVhZGVyXTogZm9ybWF0VmFsdWUodW5pZm9ybSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHRhYmxlLFxuICAgIGNvdW50LFxuICAgIHVudXNlZFRhYmxlLFxuICAgIHVudXNlZENvdW50XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFVuaWZvcm1Ub1RhYmxlKHtcbiAgdGFibGUsXG4gIGhlYWRlcixcbiAgdW5pZm9ybXMsXG4gIHVuaWZvcm1OYW1lLFxuICB1bmRlZmluZWRPbmx5XG59KSB7XG4gIGNvbnN0IHZhbHVlID0gdW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuICBjb25zdCBpc0RlZmluZWQgPSBpc1VuaWZvcm1EZWZpbmVkKHZhbHVlKTtcblxuICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgIWlzRGVmaW5lZCkge1xuICAgIHRhYmxlW3VuaWZvcm1OYW1lXSA9IHtcbiAgICAgIFtoZWFkZXJdOiBpc0RlZmluZWQgPyBmb3JtYXRWYWx1ZSh2YWx1ZSkgOiAnTi9BJyxcbiAgICAgICdVbmlmb3JtIFR5cGUnOiBpc0RlZmluZWQgPyB2YWx1ZSA6ICdOT1QgUFJPVklERUQnXG4gICAgfTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNVbmlmb3JtRGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlYnVnLXVuaWZvcm1zLmpzLm1hcCIsImltcG9ydCBCdWZmZXIgZnJvbSAnLi4vY2xhc3Nlcy9idWZmZXInO1xuaW1wb3J0IHsgZ2V0S2V5IH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvY29uc3RhbnRzLXRvLWtleXMnO1xuaW1wb3J0IHsgZ2V0Q29tcG9zaXRlR0xUeXBlIH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvYXR0cmlidXRlLXV0aWxzJztcbmltcG9ydCB7IGZvcm1hdFZhbHVlIH0gZnJvbSAnLi4vdXRpbHMvZm9ybWF0LXZhbHVlJztcbmV4cG9ydCBmdW5jdGlvbiBnZXREZWJ1Z1RhYmxlRm9yVmVydGV4QXJyYXkoe1xuICB2ZXJ0ZXhBcnJheSxcbiAgaGVhZGVyID0gJ0F0dHJpYnV0ZXMnXG59KSB7XG4gIGlmICghdmVydGV4QXJyYXkuY29uZmlndXJhdGlvbikge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGNvbnN0IHRhYmxlID0ge307XG5cbiAgaWYgKHZlcnRleEFycmF5LmVsZW1lbnRzKSB7XG4gICAgdGFibGUuRUxFTUVOVF9BUlJBWV9CVUZGRVIgPSBnZXREZWJ1Z1RhYmxlUm93KHZlcnRleEFycmF5LCB2ZXJ0ZXhBcnJheS5lbGVtZW50cywgbnVsbCwgaGVhZGVyKTtcbiAgfVxuXG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSB2ZXJ0ZXhBcnJheS52YWx1ZXM7XG5cbiAgZm9yIChjb25zdCBhdHRyaWJ1dGVMb2NhdGlvbiBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgY29uc3QgaW5mbyA9IHZlcnRleEFycmF5Ll9nZXRBdHRyaWJ1dGVJbmZvKGF0dHJpYnV0ZUxvY2F0aW9uKTtcblxuICAgIGlmIChpbmZvKSB7XG4gICAgICBsZXQgcm93SGVhZGVyID0gYCR7YXR0cmlidXRlTG9jYXRpb259OiAke2luZm8ubmFtZX1gO1xuICAgICAgY29uc3QgYWNjZXNzb3IgPSB2ZXJ0ZXhBcnJheS5hY2Nlc3NvcnNbaW5mby5sb2NhdGlvbl07XG5cbiAgICAgIGlmIChhY2Nlc3Nvcikge1xuICAgICAgICByb3dIZWFkZXIgPSBgJHthdHRyaWJ1dGVMb2NhdGlvbn06ICR7Z2V0R0xTTERlY2xhcmF0aW9uKGluZm8ubmFtZSwgYWNjZXNzb3IpfWA7XG4gICAgICB9XG5cbiAgICAgIHRhYmxlW3Jvd0hlYWRlcl0gPSBnZXREZWJ1Z1RhYmxlUm93KHZlcnRleEFycmF5LCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZUxvY2F0aW9uXSwgYWNjZXNzb3IsIGhlYWRlcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufVxuXG5mdW5jdGlvbiBnZXREZWJ1Z1RhYmxlUm93KHZlcnRleEFycmF5LCBhdHRyaWJ1dGUsIGFjY2Vzc29yLCBoZWFkZXIpIHtcbiAgY29uc3Qge1xuICAgIGdsXG4gIH0gPSB2ZXJ0ZXhBcnJheTtcblxuICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBbaGVhZGVyXTogJ251bGwnLFxuICAgICAgJ0Zvcm1hdCAnOiAnTi9BJ1xuICAgIH07XG4gIH1cblxuICBsZXQgdHlwZSA9ICdOT1QgUFJPVklERUQnO1xuICBsZXQgc2l6ZSA9IDE7XG4gIGxldCB2ZXJ0cyA9IDA7XG4gIGxldCBieXRlcyA9IDA7XG4gIGxldCBpc0ludGVnZXI7XG4gIGxldCBtYXJrZXI7XG4gIGxldCB2YWx1ZTtcblxuICBpZiAoYWNjZXNzb3IpIHtcbiAgICB0eXBlID0gYWNjZXNzb3IudHlwZTtcbiAgICBzaXplID0gYWNjZXNzb3Iuc2l6ZTtcbiAgICB0eXBlID0gU3RyaW5nKHR5cGUpLnJlcGxhY2UoJ0FycmF5JywgJycpO1xuICAgIGlzSW50ZWdlciA9IHR5cGUuaW5kZXhPZignbnQnKSAhPT0gLTE7XG4gIH1cblxuICBpZiAoYXR0cmlidXRlIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgY29uc3QgYnVmZmVyID0gYXR0cmlidXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGEsXG4gICAgICBjaGFuZ2VkXG4gICAgfSA9IGJ1ZmZlci5nZXREZWJ1Z0RhdGEoKTtcbiAgICBtYXJrZXIgPSBjaGFuZ2VkID8gJyonIDogJyc7XG4gICAgdmFsdWUgPSBkYXRhO1xuICAgIGJ5dGVzID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgdmVydHMgPSBieXRlcyAvIGRhdGEuQllURVNfUEVSX0VMRU1FTlQgLyBzaXplO1xuICAgIGxldCBmb3JtYXQ7XG5cbiAgICBpZiAoYWNjZXNzb3IpIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlZCA9IGFjY2Vzc29yLmRpdmlzb3IgPiAwO1xuICAgICAgZm9ybWF0ID0gYCR7aW5zdGFuY2VkID8gJ0kgJyA6ICdQICd9ICR7dmVydHN9ICh4JHtzaXplfT0ke2J5dGVzfSBieXRlcyAke2dldEtleShnbCwgdHlwZSl9KWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzSW50ZWdlciA9IHRydWU7XG4gICAgICBmb3JtYXQgPSBgJHtieXRlc30gYnl0ZXNgO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBbaGVhZGVyXTogYCR7bWFya2VyfSR7Zm9ybWF0VmFsdWUodmFsdWUsIHtcbiAgICAgICAgc2l6ZSxcbiAgICAgICAgaXNJbnRlZ2VyXG4gICAgICB9KX1gLFxuICAgICAgJ0Zvcm1hdCAnOiBmb3JtYXRcbiAgICB9O1xuICB9XG5cbiAgdmFsdWUgPSBhdHRyaWJ1dGU7XG4gIHNpemUgPSBhdHRyaWJ1dGUubGVuZ3RoO1xuICB0eXBlID0gU3RyaW5nKGF0dHJpYnV0ZS5jb25zdHJ1Y3Rvci5uYW1lKS5yZXBsYWNlKCdBcnJheScsICcnKTtcbiAgaXNJbnRlZ2VyID0gdHlwZS5pbmRleE9mKCdudCcpICE9PSAtMTtcbiAgcmV0dXJuIHtcbiAgICBbaGVhZGVyXTogYCR7Zm9ybWF0VmFsdWUodmFsdWUsIHtcbiAgICAgIHNpemUsXG4gICAgICBpc0ludGVnZXJcbiAgICB9KX0gKGNvbnN0YW50KWAsXG4gICAgJ0Zvcm1hdCAnOiBgJHtzaXplfXgke3R5cGV9IChjb25zdGFudClgXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEdMU0xEZWNsYXJhdGlvbihuYW1lLCBhY2Nlc3Nvcikge1xuICBjb25zdCB7XG4gICAgdHlwZSxcbiAgICBzaXplXG4gIH0gPSBhY2Nlc3NvcjtcbiAgY29uc3QgdHlwZUFuZE5hbWUgPSBnZXRDb21wb3NpdGVHTFR5cGUodHlwZSwgc2l6ZSk7XG4gIHJldHVybiB0eXBlQW5kTmFtZSA/IGAke25hbWV9ICgke3R5cGVBbmROYW1lLm5hbWV9KWAgOiBuYW1lO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVidWctdmVydGV4LWFycmF5LmpzLm1hcCIsImltcG9ydCBXRUJHTF9GRUFUVVJFUyBmcm9tICcuL3dlYmdsLWZlYXR1cmVzLXRhYmxlJztcbmltcG9ydCB7IGlzV2ViR0wyLCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5jb25zdCBMT0dfVU5TVVBQT1JURURfRkVBVFVSRSA9IDI7XG5leHBvcnQgZnVuY3Rpb24gaGFzRmVhdHVyZShnbCwgZmVhdHVyZSkge1xuICByZXR1cm4gaGFzRmVhdHVyZXMoZ2wsIGZlYXR1cmUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGhhc0ZlYXR1cmVzKGdsLCBmZWF0dXJlcykge1xuICBmZWF0dXJlcyA9IEFycmF5LmlzQXJyYXkoZmVhdHVyZXMpID8gZmVhdHVyZXMgOiBbZmVhdHVyZXNdO1xuICByZXR1cm4gZmVhdHVyZXMuZXZlcnkoZmVhdHVyZSA9PiB7XG4gICAgcmV0dXJuIGlzRmVhdHVyZVN1cHBvcnRlZChnbCwgZmVhdHVyZSk7XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEZlYXR1cmVzKGdsKSB7XG4gIGdsLmx1bWEgPSBnbC5sdW1hIHx8IHt9O1xuICBnbC5sdW1hLmNhcHMgPSBnbC5sdW1hLmNhcHMgfHwge307XG5cbiAgZm9yIChjb25zdCBjYXAgaW4gV0VCR0xfRkVBVFVSRVMpIHtcbiAgICBpZiAoZ2wubHVtYS5jYXBzW2NhcF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZ2wubHVtYS5jYXBzW2NhcF0gPSBpc0ZlYXR1cmVTdXBwb3J0ZWQoZ2wsIGNhcCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdsLmx1bWEuY2Fwcztcbn1cblxuZnVuY3Rpb24gaXNGZWF0dXJlU3VwcG9ydGVkKGdsLCBjYXApIHtcbiAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gIGdsLmx1bWEuY2FwcyA9IGdsLmx1bWEuY2FwcyB8fCB7fTtcblxuICBpZiAoZ2wubHVtYS5jYXBzW2NhcF0gPT09IHVuZGVmaW5lZCkge1xuICAgIGdsLmx1bWEuY2Fwc1tjYXBdID0gcXVlcnlGZWF0dXJlKGdsLCBjYXApO1xuICB9XG5cbiAgaWYgKCFnbC5sdW1hLmNhcHNbY2FwXSkge1xuICAgIGxvZy5sb2coTE9HX1VOU1VQUE9SVEVEX0ZFQVRVUkUsIGBGZWF0dXJlOiAke2NhcH0gbm90IHN1cHBvcnRlZGApKCk7XG4gIH1cblxuICByZXR1cm4gZ2wubHVtYS5jYXBzW2NhcF07XG59XG5cbmZ1bmN0aW9uIHF1ZXJ5RmVhdHVyZShnbCwgY2FwKSB7XG4gIGNvbnN0IGZlYXR1cmUgPSBXRUJHTF9GRUFUVVJFU1tjYXBdO1xuICBhc3NlcnQoZmVhdHVyZSwgY2FwKTtcbiAgbGV0IGlzU3VwcG9ydGVkO1xuICBjb25zdCBmZWF0dXJlRGVmaW5pdGlvbiA9IGlzV2ViR0wyKGdsKSA/IGZlYXR1cmVbMV0gfHwgZmVhdHVyZVswXSA6IGZlYXR1cmVbMF07XG5cbiAgaWYgKHR5cGVvZiBmZWF0dXJlRGVmaW5pdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlzU3VwcG9ydGVkID0gZmVhdHVyZURlZmluaXRpb24oZ2wpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZmVhdHVyZURlZmluaXRpb24pKSB7XG4gICAgaXNTdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgZmVhdHVyZURlZmluaXRpb24pIHtcbiAgICAgIGlzU3VwcG9ydGVkID0gaXNTdXBwb3J0ZWQgJiYgQm9vbGVhbihnbC5nZXRFeHRlbnNpb24oZXh0ZW5zaW9uKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBmZWF0dXJlRGVmaW5pdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICBpc1N1cHBvcnRlZCA9IEJvb2xlYW4oZ2wuZ2V0RXh0ZW5zaW9uKGZlYXR1cmVEZWZpbml0aW9uKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGZlYXR1cmVEZWZpbml0aW9uID09PSAnYm9vbGVhbicpIHtcbiAgICBpc1N1cHBvcnRlZCA9IGZlYXR1cmVEZWZpbml0aW9uO1xuICB9IGVsc2Uge1xuICAgIGFzc2VydChmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gaXNTdXBwb3J0ZWQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mZWF0dXJlcy5qcy5tYXAiLCJpbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi4vY2xhc3Nlcy9mcmFtZWJ1ZmZlcic7XG5pbXBvcnQgVGV4dHVyZTJEIGZyb20gJy4uL2NsYXNzZXMvdGV4dHVyZS0yZCc7XG5leHBvcnQgY29uc3QgRkVBVFVSRVMgPSB7XG4gIFdFQkdMMjogJ1dFQkdMMicsXG4gIFZFUlRFWF9BUlJBWV9PQkpFQ1Q6ICdWRVJURVhfQVJSQVlfT0JKRUNUJyxcbiAgVElNRVJfUVVFUlk6ICdUSU1FUl9RVUVSWScsXG4gIElOU1RBTkNFRF9SRU5ERVJJTkc6ICdJTlNUQU5DRURfUkVOREVSSU5HJyxcbiAgTVVMVElQTEVfUkVOREVSX1RBUkdFVFM6ICdNVUxUSVBMRV9SRU5ERVJfVEFSR0VUUycsXG4gIEVMRU1FTlRfSU5ERVhfVUlOVDMyOiAnRUxFTUVOVF9JTkRFWF9VSU5UMzInLFxuICBCTEVORF9FUVVBVElPTl9NSU5NQVg6ICdCTEVORF9FUVVBVElPTl9NSU5NQVgnLFxuICBGTE9BVF9CTEVORDogJ0ZMT0FUX0JMRU5EJyxcbiAgQ09MT1JfRU5DT0RJTkdfU1JHQjogJ0NPTE9SX0VOQ09ESU5HX1NSR0InLFxuICBURVhUVVJFX0RFUFRIOiAnVEVYVFVSRV9ERVBUSCcsXG4gIFRFWFRVUkVfRkxPQVQ6ICdURVhUVVJFX0ZMT0FUJyxcbiAgVEVYVFVSRV9IQUxGX0ZMT0FUOiAnVEVYVFVSRV9IQUxGX0ZMT0FUJyxcbiAgVEVYVFVSRV9GSUxURVJfTElORUFSX0ZMT0FUOiAnVEVYVFVSRV9GSUxURVJfTElORUFSX0ZMT0FUJyxcbiAgVEVYVFVSRV9GSUxURVJfTElORUFSX0hBTEZfRkxPQVQ6ICdURVhUVVJFX0ZJTFRFUl9MSU5FQVJfSEFMRl9GTE9BVCcsXG4gIFRFWFRVUkVfRklMVEVSX0FOSVNPVFJPUElDOiAnVEVYVFVSRV9GSUxURVJfQU5JU09UUk9QSUMnLFxuICBDT0xPUl9BVFRBQ0hNRU5UX1JHQkEzMkY6ICdDT0xPUl9BVFRBQ0hNRU5UX1JHQkEzMkYnLFxuICBDT0xPUl9BVFRBQ0hNRU5UX0ZMT0FUOiAnQ09MT1JfQVRUQUNITUVOVF9GTE9BVCcsXG4gIENPTE9SX0FUVEFDSE1FTlRfSEFMRl9GTE9BVDogJ0NPTE9SX0FUVEFDSE1FTlRfSEFMRl9GTE9BVCcsXG4gIEdMU0xfRlJBR19EQVRBOiAnR0xTTF9GUkFHX0RBVEEnLFxuICBHTFNMX0ZSQUdfREVQVEg6ICdHTFNMX0ZSQUdfREVQVEgnLFxuICBHTFNMX0RFUklWQVRJVkVTOiAnR0xTTF9ERVJJVkFUSVZFUycsXG4gIEdMU0xfVEVYVFVSRV9MT0Q6ICdHTFNMX1RFWFRVUkVfTE9EJ1xufTtcblxuZnVuY3Rpb24gY2hlY2tGbG9hdDMyQ29sb3JBdHRhY2htZW50KGdsKSB7XG4gIGNvbnN0IHRlc3RUZXh0dXJlID0gbmV3IFRleHR1cmUyRChnbCwge1xuICAgIGZvcm1hdDogNjQwOCxcbiAgICB0eXBlOiA1MTI2LFxuICAgIGRhdGFGb3JtYXQ6IDY0MDhcbiAgfSk7XG4gIGNvbnN0IHRlc3RGYiA9IG5ldyBGcmFtZWJ1ZmZlcihnbCwge1xuICAgIGlkOiBgdGVzdC1mcmFtZWJ1ZmZlcmAsXG4gICAgY2hlY2s6IGZhbHNlLFxuICAgIGF0dGFjaG1lbnRzOiB7XG4gICAgICBbMzYwNjRdOiB0ZXN0VGV4dHVyZVxuICAgIH1cbiAgfSk7XG4gIGNvbnN0IHN0YXR1cyA9IHRlc3RGYi5nZXRTdGF0dXMoKTtcbiAgdGVzdFRleHR1cmUuZGVsZXRlKCk7XG4gIHRlc3RGYi5kZWxldGUoKTtcbiAgcmV0dXJuIHN0YXR1cyA9PT0gMzYwNTM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgW0ZFQVRVUkVTLldFQkdMMl06IFtmYWxzZSwgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5WRVJURVhfQVJSQVlfT0JKRUNUXTogWydPRVNfdmVydGV4X2FycmF5X29iamVjdCcsIHRydWVdLFxuICBbRkVBVFVSRVMuVElNRVJfUVVFUlldOiBbJ0VYVF9kaXNqb2ludF90aW1lcl9xdWVyeScsICdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnlfd2ViZ2wyJ10sXG4gIFtGRUFUVVJFUy5JTlNUQU5DRURfUkVOREVSSU5HXTogWydBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5NVUxUSVBMRV9SRU5ERVJfVEFSR0VUU106IFsnV0VCR0xfZHJhd19idWZmZXJzJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5FTEVNRU5UX0lOREVYX1VJTlQzMl06IFsnT0VTX2VsZW1lbnRfaW5kZXhfdWludCcsIHRydWVdLFxuICBbRkVBVFVSRVMuQkxFTkRfRVFVQVRJT05fTUlOTUFYXTogWydFWFRfYmxlbmRfbWlubWF4JywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5GTE9BVF9CTEVORF06IFsnRVhUX2Zsb2F0X2JsZW5kJ10sXG4gIFtGRUFUVVJFUy5DT0xPUl9FTkNPRElOR19TUkdCXTogWydFWFRfc1JHQicsIHRydWVdLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9ERVBUSF06IFsnV0VCR0xfZGVwdGhfdGV4dHVyZScsIHRydWVdLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9GTE9BVF06IFsnT0VTX3RleHR1cmVfZmxvYXQnLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLlRFWFRVUkVfSEFMRl9GTE9BVF06IFsnT0VTX3RleHR1cmVfaGFsZl9mbG9hdCcsIHRydWVdLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9GSUxURVJfTElORUFSX0ZMT0FUXTogWydPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInXSxcbiAgW0ZFQVRVUkVTLlRFWFRVUkVfRklMVEVSX0xJTkVBUl9IQUxGX0ZMT0FUXTogWydPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhciddLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9GSUxURVJfQU5JU09UUk9QSUNdOiBbJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYyddLFxuICBbRkVBVFVSRVMuQ09MT1JfQVRUQUNITUVOVF9SR0JBMzJGXTogW2NoZWNrRmxvYXQzMkNvbG9yQXR0YWNobWVudCwgJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnXSxcbiAgW0ZFQVRVUkVTLkNPTE9SX0FUVEFDSE1FTlRfRkxPQVRdOiBbZmFsc2UsICdFWFRfY29sb3JfYnVmZmVyX2Zsb2F0J10sXG4gIFtGRUFUVVJFUy5DT0xPUl9BVFRBQ0hNRU5UX0hBTEZfRkxPQVRdOiBbJ0VYVF9jb2xvcl9idWZmZXJfaGFsZl9mbG9hdCddLFxuICBbRkVBVFVSRVMuR0xTTF9GUkFHX0RBVEFdOiBbJ1dFQkdMX2RyYXdfYnVmZmVycycsIHRydWVdLFxuICBbRkVBVFVSRVMuR0xTTF9GUkFHX0RFUFRIXTogWydFWFRfZnJhZ19kZXB0aCcsIHRydWVdLFxuICBbRkVBVFVSRVMuR0xTTF9ERVJJVkFUSVZFU106IFsnT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5HTFNMX1RFWFRVUkVfTE9EXTogWydFWFRfc2hhZGVyX3RleHR1cmVfbG9kJywgdHJ1ZV1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJnbC1mZWF0dXJlcy10YWJsZS5qcy5tYXAiLCJpbXBvcnQgZ2V0U2hhZGVyTmFtZSBmcm9tICcuL2dldC1zaGFkZXItbmFtZSc7XG5pbXBvcnQgZ2V0U2hhZGVyVHlwZU5hbWUgZnJvbSAnLi9nZXQtc2hhZGVyLXR5cGUtbmFtZSc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JtYXRHTFNMQ29tcGlsZXJFcnJvcihlcnJMb2csIHNyYywgc2hhZGVyVHlwZSkge1xuICBjb25zdCB7XG4gICAgc2hhZGVyTmFtZSxcbiAgICBlcnJvcnMsXG4gICAgd2FybmluZ3NcbiAgfSA9IHBhcnNlR0xTTENvbXBpbGVyRXJyb3IoZXJyTG9nLCBzcmMsIHNoYWRlclR5cGUpO1xuICByZXR1cm4gYEdMU0wgY29tcGlsYXRpb24gZXJyb3IgaW4gJHtzaGFkZXJOYW1lfVxcblxcbiR7ZXJyb3JzfVxcbiR7d2FybmluZ3N9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUdMU0xDb21waWxlckVycm9yKGVyckxvZywgc3JjLCBzaGFkZXJUeXBlLCBzaGFkZXJOYW1lKSB7XG4gIGNvbnN0IGVycm9yU3RyaW5ncyA9IGVyckxvZy5zcGxpdCgvXFxyP1xcbi8pO1xuICBjb25zdCBlcnJvcnMgPSB7fTtcbiAgY29uc3Qgd2FybmluZ3MgPSB7fTtcbiAgY29uc3QgbmFtZSA9IHNoYWRlck5hbWUgfHwgZ2V0U2hhZGVyTmFtZShzcmMpIHx8ICcodW5uYW1lZCknO1xuICBjb25zdCBzaGFkZXJEZXNjcmlwdGlvbiA9IGAke2dldFNoYWRlclR5cGVOYW1lKHNoYWRlclR5cGUpfSBzaGFkZXIgJHtuYW1lfWA7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlcnJvclN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlcnJvclN0cmluZyA9IGVycm9yU3RyaW5nc1tpXTtcblxuICAgIGlmIChlcnJvclN0cmluZy5sZW5ndGggPD0gMSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VnbWVudHMgPSBlcnJvclN0cmluZy5zcGxpdCgnOicpO1xuICAgIGNvbnN0IHR5cGUgPSBzZWdtZW50c1swXTtcbiAgICBjb25zdCBsaW5lID0gcGFyc2VJbnQoc2VnbWVudHNbMl0sIDEwKTtcblxuICAgIGlmIChpc05hTihsaW5lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBHTFNMIGNvbXBpbGF0aW9uIGVycm9yIGluICR7c2hhZGVyRGVzY3JpcHRpb259OiAke2VyckxvZ31gKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPT0gJ1dBUk5JTkcnKSB7XG4gICAgICBlcnJvcnNbbGluZV0gPSBlcnJvclN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgd2FybmluZ3NbbGluZV0gPSBlcnJvclN0cmluZztcbiAgICB9XG4gIH1cblxuICBjb25zdCBsaW5lcyA9IGFkZExpbmVOdW1iZXJzKHNyYyk7XG4gIHJldHVybiB7XG4gICAgc2hhZGVyTmFtZTogc2hhZGVyRGVzY3JpcHRpb24sXG4gICAgZXJyb3JzOiBmb3JtYXRFcnJvcnMoZXJyb3JzLCBsaW5lcyksXG4gICAgd2FybmluZ3M6IGZvcm1hdEVycm9ycyh3YXJuaW5ncywgbGluZXMpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9ycyhlcnJvcnMsIGxpbmVzKSB7XG4gIGxldCBtZXNzYWdlID0gJyc7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcblxuICAgIGlmICghZXJyb3JzW2kgKyAzXSAmJiAhZXJyb3JzW2kgKyAyXSAmJiAhZXJyb3JzW2kgKyAxXSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbWVzc2FnZSArPSBgJHtsaW5lfVxcbmA7XG5cbiAgICBpZiAoZXJyb3JzW2kgKyAxXSkge1xuICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnNbaSArIDFdO1xuICAgICAgY29uc3Qgc2VnbWVudHMgPSBlcnJvci5zcGxpdCgnOicsIDMpO1xuICAgICAgY29uc3QgdHlwZSA9IHNlZ21lbnRzWzBdO1xuICAgICAgY29uc3QgY29sdW1uID0gcGFyc2VJbnQoc2VnbWVudHNbMV0sIDEwKSB8fCAwO1xuICAgICAgY29uc3QgZXJyID0gZXJyb3Iuc3Vic3RyaW5nKHNlZ21lbnRzLmpvaW4oJzonKS5sZW5ndGggKyAxKS50cmltKCk7XG4gICAgICBtZXNzYWdlICs9IHBhZExlZnQoYF5eXiAke3R5cGV9OiAke2Vycn1cXG5cXG5gLCBjb2x1bW4pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlO1xufVxuXG5mdW5jdGlvbiBhZGRMaW5lTnVtYmVycyhzdHJpbmcsIHN0YXJ0ID0gMSwgZGVsaW0gPSAnOiAnKSB7XG4gIGNvbnN0IGxpbmVzID0gc3RyaW5nLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IG1heERpZ2l0cyA9IFN0cmluZyhsaW5lcy5sZW5ndGggKyBzdGFydCAtIDEpLmxlbmd0aDtcbiAgcmV0dXJuIGxpbmVzLm1hcCgobGluZSwgaSkgPT4ge1xuICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBTdHJpbmcoaSArIHN0YXJ0KTtcbiAgICBjb25zdCBkaWdpdHMgPSBsaW5lTnVtYmVyLmxlbmd0aDtcbiAgICBjb25zdCBwcmVmaXggPSBwYWRMZWZ0KGxpbmVOdW1iZXIsIG1heERpZ2l0cyAtIGRpZ2l0cyk7XG4gICAgcmV0dXJuIHByZWZpeCArIGRlbGltICsgbGluZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhZExlZnQoc3RyaW5nLCBkaWdpdHMpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlnaXRzOyArK2kpIHtcbiAgICByZXN1bHQgKz0gJyAnO1xuICB9XG5cbiAgcmV0dXJuIGAke3Jlc3VsdH0ke3N0cmluZ31gO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9ybWF0LWdsc2wtZXJyb3IuanMubWFwIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2hhZGVyTmFtZShzaGFkZXIsIGRlZmF1bHROYW1lID0gJ3VubmFtZWQnKSB7XG4gIGNvbnN0IFNIQURFUl9OQU1FX1JFR0VYUCA9IC8jZGVmaW5lW1xccypdU0hBREVSX05BTUVbXFxzKl0oW0EtWmEtejAtOV8tXSspW1xccypdLztcbiAgY29uc3QgbWF0Y2ggPSBzaGFkZXIubWF0Y2goU0hBREVSX05BTUVfUkVHRVhQKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBkZWZhdWx0TmFtZTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldC1zaGFkZXItbmFtZS5qcy5tYXAiLCJjb25zdCBHTF9GUkFHTUVOVF9TSEFERVIgPSAweDhiMzA7XG5jb25zdCBHTF9WRVJURVhfU0hBREVSID0gMHg4YjMxO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2hhZGVyVHlwZU5hbWUodHlwZSkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEdMX0ZSQUdNRU5UX1NIQURFUjpcbiAgICAgIHJldHVybiAnZnJhZ21lbnQnO1xuXG4gICAgY2FzZSBHTF9WRVJURVhfU0hBREVSOlxuICAgICAgcmV0dXJuICd2ZXJ0ZXgnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAndW5rbm93biB0eXBlJztcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0LXNoYWRlci10eXBlLW5hbWUuanMubWFwIiwiaW1wb3J0IHsgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBTdGF0cyB9IGZyb20gJ3Byb2JlLmdsJztcbmltcG9ydCB7IGlzQnJvd3NlciwgZ2xvYmFsIH0gZnJvbSAncHJvYmUuZ2wvZW52JztcbmNvbnN0IFZFUlNJT04gPSB0eXBlb2YgXCI4LjUuMTBcIiAhPT0gJ3VuZGVmaW5lZCcgPyBcIjguNS4xMFwiIDogJ3VudHJhbnNwaWxlZCBzb3VyY2UnO1xuY29uc3QgU1RBUlRVUF9NRVNTQUdFID0gJ3NldCBsdW1hLmxvZy5sZXZlbD0xIChvciBoaWdoZXIpIHRvIHRyYWNlIHJlbmRlcmluZyc7XG5cbmNsYXNzIFN0YXRzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdHMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBnZXQobmFtZSkge1xuICAgIGlmICghdGhpcy5zdGF0cy5oYXMobmFtZSkpIHtcbiAgICAgIHRoaXMuc3RhdHMuc2V0KG5hbWUsIG5ldyBTdGF0cyh7XG4gICAgICAgIGlkOiBuYW1lXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RhdHMuZ2V0KG5hbWUpO1xuICB9XG5cbn1cblxuY29uc3QgbHVtYVN0YXRzID0gbmV3IFN0YXRzTWFuYWdlcigpO1xuXG5pZiAoZ2xvYmFsLmx1bWEgJiYgZ2xvYmFsLmx1bWEuVkVSU0lPTiAhPT0gVkVSU0lPTikge1xuICB0aHJvdyBuZXcgRXJyb3IoYGx1bWEuZ2wgLSBtdWx0aXBsZSBWRVJTSU9OcyBkZXRlY3RlZDogJHtnbG9iYWwubHVtYS5WRVJTSU9OfSB2cyAke1ZFUlNJT059YCk7XG59XG5cbmlmICghZ2xvYmFsLmx1bWEpIHtcbiAgaWYgKGlzQnJvd3NlcigpKSB7XG4gICAgbG9nLmxvZygxLCBgbHVtYS5nbCAke1ZFUlNJT059IC0gJHtTVEFSVFVQX01FU1NBR0V9YCkoKTtcbiAgfVxuXG4gIGdsb2JhbC5sdW1hID0gZ2xvYmFsLmx1bWEgfHwge1xuICAgIFZFUlNJT04sXG4gICAgdmVyc2lvbjogVkVSU0lPTixcbiAgICBsb2csXG4gICAgc3RhdHM6IGx1bWFTdGF0cyxcbiAgICBnbG9iYWxzOiB7XG4gICAgICBtb2R1bGVzOiB7fSxcbiAgICAgIG5vZGVJTzoge31cbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCB7IGx1bWFTdGF0cyB9O1xuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsLmx1bWE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbml0LmpzLm1hcCIsImxldCBhcnJheUJ1ZmZlciA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NyYXRjaEFycmF5QnVmZmVyKGJ5dGVMZW5ndGgpIHtcbiAgaWYgKCFhcnJheUJ1ZmZlciB8fCBhcnJheUJ1ZmZlci5ieXRlTGVuZ3RoIDwgYnl0ZUxlbmd0aCkge1xuICAgIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVMZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5QnVmZmVyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNjcmF0Y2hBcnJheShUeXBlLCBsZW5ndGgpIHtcbiAgY29uc3Qgc2NyYXRjaEFycmF5QnVmZmVyID0gZ2V0U2NyYXRjaEFycmF5QnVmZmVyKFR5cGUuQllURVNfUEVSX0VMRU1FTlQgKiBsZW5ndGgpO1xuICByZXR1cm4gbmV3IFR5cGUoc2NyYXRjaEFycmF5QnVmZmVyLCAwLCBsZW5ndGgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZpbGxBcnJheSh7XG4gIHRhcmdldCxcbiAgc291cmNlLFxuICBzdGFydCA9IDAsXG4gIGNvdW50ID0gMVxufSkge1xuICBjb25zdCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuICBjb25zdCB0b3RhbCA9IGNvdW50ICogbGVuZ3RoO1xuICBsZXQgY29waWVkID0gMDtcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGNvcGllZCA8IGxlbmd0aDsgY29waWVkKyspIHtcbiAgICB0YXJnZXRbaSsrXSA9IHNvdXJjZVtjb3BpZWRdO1xuICB9XG5cbiAgd2hpbGUgKGNvcGllZCA8IHRvdGFsKSB7XG4gICAgaWYgKGNvcGllZCA8IHRvdGFsIC0gY29waWVkKSB7XG4gICAgICB0YXJnZXQuY29weVdpdGhpbihzdGFydCArIGNvcGllZCwgc3RhcnQsIHN0YXJ0ICsgY29waWVkKTtcbiAgICAgIGNvcGllZCAqPSAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQuY29weVdpdGhpbihzdGFydCArIGNvcGllZCwgc3RhcnQsIHN0YXJ0ICsgdG90YWwgLSBjb3BpZWQpO1xuICAgICAgY29waWVkID0gdG90YWw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFycmF5LXV0aWxzLWZsYXQuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnbHVtYS5nbDogYXNzZXJ0aW9uIGZhaWxlZC4nKTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0LmpzLm1hcCIsImltcG9ydCB7IGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUHJvcHMoY2xhc3NOYW1lLCBwcm9wcywgcHJvcENoZWNrcykge1xuICBjb25zdCB7XG4gICAgcmVtb3ZlZFByb3BzID0ge30sXG4gICAgZGVwcmVjYXRlZFByb3BzID0ge30sXG4gICAgcmVwbGFjZWRQcm9wcyA9IHt9XG4gIH0gPSBwcm9wQ2hlY2tzO1xuXG4gIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gcmVtb3ZlZFByb3BzKSB7XG4gICAgaWYgKHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICBjb25zdCByZXBsYWNlbWVudFByb3AgPSByZW1vdmVkUHJvcHNbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSByZXBsYWNlbWVudFByb3AgPyBgJHtjbGFzc05hbWV9LiR7cmVtb3ZlZFByb3BzW3Byb3BOYW1lXX1gIDogJ04vQSc7XG4gICAgICBsb2cucmVtb3ZlZChgJHtjbGFzc05hbWV9LiR7cHJvcE5hbWV9YCwgcmVwbGFjZW1lbnQpKCk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBkZXByZWNhdGVkUHJvcHMpIHtcbiAgICBpZiAocHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50UHJvcCA9IGRlcHJlY2F0ZWRQcm9wc1twcm9wTmFtZV07XG4gICAgICBsb2cuZGVwcmVjYXRlZChgJHtjbGFzc05hbWV9LiR7cHJvcE5hbWV9YCwgYCR7Y2xhc3NOYW1lfS4ke3JlcGxhY2VtZW50UHJvcH1gKSgpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBuZXdQcm9wcyA9IG51bGw7XG5cbiAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiByZXBsYWNlZFByb3BzKSB7XG4gICAgaWYgKHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICBjb25zdCByZXBsYWNlbWVudFByb3AgPSByZXBsYWNlZFByb3BzW3Byb3BOYW1lXTtcbiAgICAgIGxvZy5kZXByZWNhdGVkKGAke2NsYXNzTmFtZX0uJHtwcm9wTmFtZX1gLCBgJHtjbGFzc05hbWV9LiR7cmVwbGFjZW1lbnRQcm9wfWApKCk7XG4gICAgICBuZXdQcm9wcyA9IG5ld1Byb3BzIHx8IE9iamVjdC5hc3NpZ24oe30sIHByb3BzKTtcbiAgICAgIG5ld1Byb3BzW3JlcGxhY2VtZW50UHJvcF0gPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBkZWxldGUgbmV3UHJvcHNbcHJvcE5hbWVdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdQcm9wcyB8fCBwcm9wcztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNoZWNrLXByb3BzLmpzLm1hcCIsImZ1bmN0aW9uIGZvcm1hdEFycmF5VmFsdWUodiwgb3B0cykge1xuICBjb25zdCB7XG4gICAgbWF4RWx0cyA9IDE2LFxuICAgIHNpemUgPSAxXG4gIH0gPSBvcHRzO1xuICBsZXQgc3RyaW5nID0gJ1snO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdi5sZW5ndGggJiYgaSA8IG1heEVsdHM7ICsraSkge1xuICAgIGlmIChpID4gMCkge1xuICAgICAgc3RyaW5nICs9IGAsJHtpICUgc2l6ZSA9PT0gMCA/ICcgJyA6ICcnfWA7XG4gICAgfVxuXG4gICAgc3RyaW5nICs9IGZvcm1hdFZhbHVlKHZbaV0sIG9wdHMpO1xuICB9XG5cbiAgY29uc3QgdGVybWluYXRvciA9IHYubGVuZ3RoID4gbWF4RWx0cyA/ICcuLi4nIDogJ10nO1xuICByZXR1cm4gYCR7c3RyaW5nfSR7dGVybWluYXRvcn1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VmFsdWUodiwgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IEVQU0lMT04gPSAxZS0xNjtcbiAgY29uc3Qge1xuICAgIGlzSW50ZWdlciA9IGZhbHNlXG4gIH0gPSBvcHRzO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHYpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2KSkge1xuICAgIHJldHVybiBmb3JtYXRBcnJheVZhbHVlKHYsIG9wdHMpO1xuICB9XG5cbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodikpIHtcbiAgICByZXR1cm4gU3RyaW5nKHYpO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHYpIDwgRVBTSUxPTikge1xuICAgIHJldHVybiBpc0ludGVnZXIgPyAnMCcgOiAnMC4nO1xuICB9XG5cbiAgaWYgKGlzSW50ZWdlcikge1xuICAgIHJldHVybiB2LnRvRml4ZWQoMCk7XG4gIH1cblxuICBpZiAoTWF0aC5hYnModikgPiAxMDAgJiYgTWF0aC5hYnModikgPCAxMDAwMCkge1xuICAgIHJldHVybiB2LnRvRml4ZWQoMCk7XG4gIH1cblxuICBjb25zdCBzdHJpbmcgPSB2LnRvUHJlY2lzaW9uKDIpO1xuICBjb25zdCBkZWNpbWFsID0gc3RyaW5nLmluZGV4T2YoJy4wJyk7XG4gIHJldHVybiBkZWNpbWFsID09PSBzdHJpbmcubGVuZ3RoIC0gMiA/IHN0cmluZy5zbGljZSgwLCAtMSkgOiBzdHJpbmc7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mb3JtYXQtdmFsdWUuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmxldCBwYXRoUHJlZml4ID0gJyc7XG5leHBvcnQgZnVuY3Rpb24gc2V0UGF0aFByZWZpeChwcmVmaXgpIHtcbiAgcGF0aFByZWZpeCA9IHByZWZpeDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZSh1cmwsIG9wdGlvbnMgPSB7fSkge1xuICBhc3NlcnQodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpO1xuICB1cmwgPSBwYXRoUHJlZml4ICsgdXJsO1xuICBjb25zdCBkYXRhVHlwZSA9IG9wdGlvbnMuZGF0YVR5cGUgfHwgJ3RleHQnO1xuICByZXR1cm4gZmV0Y2godXJsLCBvcHRpb25zKS50aGVuKHJlcyA9PiByZXNbZGF0YVR5cGVdKCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRJbWFnZSh1cmwsIG9wdHMpIHtcbiAgYXNzZXJ0KHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKTtcbiAgdXJsID0gcGF0aFByZWZpeCArIHVybDtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWFnZSk7XG5cbiAgICAgIGltYWdlLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgbG9hZCBpbWFnZSAke3VybH0uYCkpO1xuXG4gICAgICBpbWFnZS5jcm9zc09yaWdpbiA9IG9wdHMgJiYgb3B0cy5jcm9zc09yaWdpbiB8fCAnYW5vbnltb3VzJztcbiAgICAgIGltYWdlLnNyYyA9IHVybDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9hZC1maWxlLmpzLm1hcCIsImltcG9ydCB7IGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHN0dWJSZW1vdmVkTWV0aG9kcyhpbnN0YW5jZSwgY2xhc3NOYW1lLCB2ZXJzaW9uLCBtZXRob2ROYW1lcykge1xuICBjb25zdCB1cGdyYWRlTWVzc2FnZSA9IGBTZWUgbHVtYS5nbCAke3ZlcnNpb259IFVwZ3JhZGUgR3VpZGUgYXQgXFxcbmh0dHBzOi8vbHVtYS5nbC9kb2NzL3VwZ3JhZGUtZ3VpZGVgO1xuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoaW5zdGFuY2UpO1xuICBtZXRob2ROYW1lcy5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgIGlmIChwcm90b3R5cGUubWV0aG9kTmFtZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHByb3RvdHlwZVttZXRob2ROYW1lXSA9ICgpID0+IHtcbiAgICAgIGxvZy5yZW1vdmVkKGBDYWxsaW5nIHJlbW92ZWQgbWV0aG9kICR7Y2xhc3NOYW1lfS4ke21ldGhvZE5hbWV9OiBgLCB1cGdyYWRlTWVzc2FnZSkoKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXRob2ROYW1lKTtcbiAgICB9O1xuICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0dWItbWV0aG9kcy5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuL2Fzc2VydCc7XG5jb25zdCB1aWRDb3VudGVycyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHVpZChpZCA9ICdpZCcpIHtcbiAgdWlkQ291bnRlcnNbaWRdID0gdWlkQ291bnRlcnNbaWRdIHx8IDE7XG4gIGNvbnN0IGNvdW50ID0gdWlkQ291bnRlcnNbaWRdKys7XG4gIHJldHVybiBgJHtpZH0tJHtjb3VudH1gO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUG93ZXJPZlR3byhuKSB7XG4gIGFzc2VydCh0eXBlb2YgbiA9PT0gJ251bWJlcicsICdJbnB1dCBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIHJldHVybiBuICYmIChuICYgbiAtIDEpID09PSAwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0RW1wdHkob2JqKSB7XG4gIGxldCBpc0VtcHR5ID0gdHJ1ZTtcblxuICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICBpc0VtcHR5ID0gZmFsc2U7XG4gICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gaXNFbXB0eTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5jb25zdCBHTF9CWVRFID0gMHgxNDAwO1xuY29uc3QgR0xfVU5TSUdORURfQllURSA9IDB4MTQwMTtcbmNvbnN0IEdMX1NIT1JUID0gMHgxNDAyO1xuY29uc3QgR0xfVU5TSUdORURfU0hPUlQgPSAweDE0MDM7XG5jb25zdCBHTF9QT0lOVFMgPSAweDA7XG5jb25zdCBHTF9MSU5FUyA9IDB4MTtcbmNvbnN0IEdMX0xJTkVfTE9PUCA9IDB4MjtcbmNvbnN0IEdMX0xJTkVfU1RSSVAgPSAweDM7XG5jb25zdCBHTF9UUklBTkdMRVMgPSAweDQ7XG5jb25zdCBHTF9UUklBTkdMRV9TVFJJUCA9IDB4NTtcbmNvbnN0IEdMX1RSSUFOR0xFX0ZBTiA9IDB4NjtcbmNvbnN0IEdMX0ZMT0FUID0gMHgxNDA2O1xuY29uc3QgR0xfRkxPQVRfVkVDMiA9IDB4OGI1MDtcbmNvbnN0IEdMX0ZMT0FUX1ZFQzMgPSAweDhiNTE7XG5jb25zdCBHTF9GTE9BVF9WRUM0ID0gMHg4YjUyO1xuY29uc3QgR0xfSU5UID0gMHgxNDA0O1xuY29uc3QgR0xfSU5UX1ZFQzIgPSAweDhiNTM7XG5jb25zdCBHTF9JTlRfVkVDMyA9IDB4OGI1NDtcbmNvbnN0IEdMX0lOVF9WRUM0ID0gMHg4YjU1O1xuY29uc3QgR0xfVU5TSUdORURfSU5UID0gMHgxNDA1O1xuY29uc3QgR0xfVU5TSUdORURfSU5UX1ZFQzIgPSAweDhkYzY7XG5jb25zdCBHTF9VTlNJR05FRF9JTlRfVkVDMyA9IDB4OGRjNztcbmNvbnN0IEdMX1VOU0lHTkVEX0lOVF9WRUM0ID0gMHg4ZGM4O1xuY29uc3QgR0xfQk9PTCA9IDB4OGI1NjtcbmNvbnN0IEdMX0JPT0xfVkVDMiA9IDB4OGI1NztcbmNvbnN0IEdMX0JPT0xfVkVDMyA9IDB4OGI1ODtcbmNvbnN0IEdMX0JPT0xfVkVDNCA9IDB4OGI1OTtcbmNvbnN0IEdMX0ZMT0FUX01BVDIgPSAweDhiNWE7XG5jb25zdCBHTF9GTE9BVF9NQVQzID0gMHg4YjViO1xuY29uc3QgR0xfRkxPQVRfTUFUNCA9IDB4OGI1YztcbmNvbnN0IEdMX0ZMT0FUX01BVDJ4MyA9IDB4OGI2NTtcbmNvbnN0IEdMX0ZMT0FUX01BVDJ4NCA9IDB4OGI2NjtcbmNvbnN0IEdMX0ZMT0FUX01BVDN4MiA9IDB4OGI2NztcbmNvbnN0IEdMX0ZMT0FUX01BVDN4NCA9IDB4OGI2ODtcbmNvbnN0IEdMX0ZMT0FUX01BVDR4MiA9IDB4OGI2OTtcbmNvbnN0IEdMX0ZMT0FUX01BVDR4MyA9IDB4OGI2YTtcbmNvbnN0IENPTVBPU0lURV9HTF9UWVBFUyA9IHtcbiAgW0dMX0ZMT0FUXTogW0dMX0ZMT0FULCAxLCAnZmxvYXQnXSxcbiAgW0dMX0ZMT0FUX1ZFQzJdOiBbR0xfRkxPQVQsIDIsICd2ZWMyJ10sXG4gIFtHTF9GTE9BVF9WRUMzXTogW0dMX0ZMT0FULCAzLCAndmVjMyddLFxuICBbR0xfRkxPQVRfVkVDNF06IFtHTF9GTE9BVCwgNCwgJ3ZlYzQnXSxcbiAgW0dMX0lOVF06IFtHTF9JTlQsIDEsICdpbnQnXSxcbiAgW0dMX0lOVF9WRUMyXTogW0dMX0lOVCwgMiwgJ2l2ZWMyJ10sXG4gIFtHTF9JTlRfVkVDM106IFtHTF9JTlQsIDMsICdpdmVjMyddLFxuICBbR0xfSU5UX1ZFQzRdOiBbR0xfSU5ULCA0LCAnaXZlYzQnXSxcbiAgW0dMX1VOU0lHTkVEX0lOVF06IFtHTF9VTlNJR05FRF9JTlQsIDEsICd1aW50J10sXG4gIFtHTF9VTlNJR05FRF9JTlRfVkVDMl06IFtHTF9VTlNJR05FRF9JTlQsIDIsICd1dmVjMiddLFxuICBbR0xfVU5TSUdORURfSU5UX1ZFQzNdOiBbR0xfVU5TSUdORURfSU5ULCAzLCAndXZlYzMnXSxcbiAgW0dMX1VOU0lHTkVEX0lOVF9WRUM0XTogW0dMX1VOU0lHTkVEX0lOVCwgNCwgJ3V2ZWM0J10sXG4gIFtHTF9CT09MXTogW0dMX0ZMT0FULCAxLCAnYm9vbCddLFxuICBbR0xfQk9PTF9WRUMyXTogW0dMX0ZMT0FULCAyLCAnYnZlYzInXSxcbiAgW0dMX0JPT0xfVkVDM106IFtHTF9GTE9BVCwgMywgJ2J2ZWMzJ10sXG4gIFtHTF9CT09MX1ZFQzRdOiBbR0xfRkxPQVQsIDQsICdidmVjNCddLFxuICBbR0xfRkxPQVRfTUFUMl06IFtHTF9GTE9BVCwgOCwgJ21hdDInXSxcbiAgW0dMX0ZMT0FUX01BVDJ4M106IFtHTF9GTE9BVCwgOCwgJ21hdDJ4MyddLFxuICBbR0xfRkxPQVRfTUFUMng0XTogW0dMX0ZMT0FULCA4LCAnbWF0Mng0J10sXG4gIFtHTF9GTE9BVF9NQVQzXTogW0dMX0ZMT0FULCAxMiwgJ21hdDMnXSxcbiAgW0dMX0ZMT0FUX01BVDN4Ml06IFtHTF9GTE9BVCwgMTIsICdtYXQzeDInXSxcbiAgW0dMX0ZMT0FUX01BVDN4NF06IFtHTF9GTE9BVCwgMTIsICdtYXQzeDQnXSxcbiAgW0dMX0ZMT0FUX01BVDRdOiBbR0xfRkxPQVQsIDE2LCAnbWF0NCddLFxuICBbR0xfRkxPQVRfTUFUNHgyXTogW0dMX0ZMT0FULCAxNiwgJ21hdDR4MiddLFxuICBbR0xfRkxPQVRfTUFUNHgzXTogW0dMX0ZMT0FULCAxNiwgJ21hdDR4MyddXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1pdGl2ZURyYXdNb2RlKGRyYXdNb2RlKSB7XG4gIHN3aXRjaCAoZHJhd01vZGUpIHtcbiAgICBjYXNlIEdMX1BPSU5UUzpcbiAgICAgIHJldHVybiBHTF9QT0lOVFM7XG5cbiAgICBjYXNlIEdMX0xJTkVTOlxuICAgICAgcmV0dXJuIEdMX0xJTkVTO1xuXG4gICAgY2FzZSBHTF9MSU5FX1NUUklQOlxuICAgICAgcmV0dXJuIEdMX0xJTkVTO1xuXG4gICAgY2FzZSBHTF9MSU5FX0xPT1A6XG4gICAgICByZXR1cm4gR0xfTElORVM7XG5cbiAgICBjYXNlIEdMX1RSSUFOR0xFUzpcbiAgICAgIHJldHVybiBHTF9UUklBTkdMRVM7XG5cbiAgICBjYXNlIEdMX1RSSUFOR0xFX1NUUklQOlxuICAgICAgcmV0dXJuIEdMX1RSSUFOR0xFUztcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVfRkFOOlxuICAgICAgcmV0dXJuIEdMX1RSSUFOR0xFUztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgcmV0dXJuIDA7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmltaXRpdmVDb3VudCh7XG4gIGRyYXdNb2RlLFxuICB2ZXJ0ZXhDb3VudFxufSkge1xuICBzd2l0Y2ggKGRyYXdNb2RlKSB7XG4gICAgY2FzZSBHTF9QT0lOVFM6XG4gICAgY2FzZSBHTF9MSU5FX0xPT1A6XG4gICAgICByZXR1cm4gdmVydGV4Q291bnQ7XG5cbiAgICBjYXNlIEdMX0xJTkVTOlxuICAgICAgcmV0dXJuIHZlcnRleENvdW50IC8gMjtcblxuICAgIGNhc2UgR0xfTElORV9TVFJJUDpcbiAgICAgIHJldHVybiB2ZXJ0ZXhDb3VudCAtIDE7XG5cbiAgICBjYXNlIEdMX1RSSUFOR0xFUzpcbiAgICAgIHJldHVybiB2ZXJ0ZXhDb3VudCAvIDM7XG5cbiAgICBjYXNlIEdMX1RSSUFOR0xFX1NUUklQOlxuICAgIGNhc2UgR0xfVFJJQU5HTEVfRkFOOlxuICAgICAgcmV0dXJuIHZlcnRleENvdW50IC0gMjtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgcmV0dXJuIDA7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJ0ZXhDb3VudCh7XG4gIGRyYXdNb2RlLFxuICB2ZXJ0ZXhDb3VudFxufSkge1xuICBjb25zdCBwcmltaXRpdmVDb3VudCA9IGdldFByaW1pdGl2ZUNvdW50KHtcbiAgICBkcmF3TW9kZSxcbiAgICB2ZXJ0ZXhDb3VudFxuICB9KTtcblxuICBzd2l0Y2ggKGdldFByaW1pdGl2ZURyYXdNb2RlKGRyYXdNb2RlKSkge1xuICAgIGNhc2UgR0xfUE9JTlRTOlxuICAgICAgcmV0dXJuIHByaW1pdGl2ZUNvdW50O1xuXG4gICAgY2FzZSBHTF9MSU5FUzpcbiAgICAgIHJldHVybiBwcmltaXRpdmVDb3VudCAqIDI7XG5cbiAgICBjYXNlIEdMX1RSSUFOR0xFUzpcbiAgICAgIHJldHVybiBwcmltaXRpdmVDb3VudCAqIDM7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgIHJldHVybiAwO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb21wb3NlQ29tcG9zaXRlR0xUeXBlKGNvbXBvc2l0ZUdMVHlwZSkge1xuICBjb25zdCB0eXBlQW5kU2l6ZSA9IENPTVBPU0lURV9HTF9UWVBFU1tjb21wb3NpdGVHTFR5cGVdO1xuXG4gIGlmICghdHlwZUFuZFNpemUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFt0eXBlLCBjb21wb25lbnRzXSA9IHR5cGVBbmRTaXplO1xuICByZXR1cm4ge1xuICAgIHR5cGUsXG4gICAgY29tcG9uZW50c1xuICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvc2l0ZUdMVHlwZSh0eXBlLCBjb21wb25lbnRzKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgR0xfQllURTpcbiAgICBjYXNlIEdMX1VOU0lHTkVEX0JZVEU6XG4gICAgY2FzZSBHTF9TSE9SVDpcbiAgICBjYXNlIEdMX1VOU0lHTkVEX1NIT1JUOlxuICAgICAgdHlwZSA9IEdMX0ZMT0FUO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICB9XG5cbiAgZm9yIChjb25zdCBnbFR5cGUgaW4gQ09NUE9TSVRFX0dMX1RZUEVTKSB7XG4gICAgY29uc3QgW2NvbXBUeXBlLCBjb21wQ29tcG9uZW50cywgbmFtZV0gPSBDT01QT1NJVEVfR0xfVFlQRVNbZ2xUeXBlXTtcblxuICAgIGlmIChjb21wVHlwZSA9PT0gdHlwZSAmJiBjb21wQ29tcG9uZW50cyA9PT0gY29tcG9uZW50cykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ2xUeXBlLFxuICAgICAgICBuYW1lXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlLXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5VmFsdWUoZ2wsIG5hbWUpIHtcbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgY29uc3QgbnVtYmVyID0gTnVtYmVyKG5hbWUpO1xuXG4gIGlmICghaXNOYU4obnVtYmVyKSkge1xuICAgIHJldHVybiBudW1iZXI7XG4gIH1cblxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9eLipcXC4vLCAnJyk7XG4gIGNvbnN0IHZhbHVlID0gZ2xbbmFtZV07XG4gIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkLCBgQWNjZXNzaW5nIHVuZGVmaW5lZCBjb25zdGFudCBHTC4ke25hbWV9YCk7XG4gIHJldHVybiB2YWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXkoZ2wsIHZhbHVlKSB7XG4gIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblxuICBmb3IgKGNvbnN0IGtleSBpbiBnbCkge1xuICAgIGlmIChnbFtrZXldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGBHTC4ke2tleX1gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleVR5cGUoZ2wsIHZhbHVlKSB7XG4gIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkLCAndW5kZWZpbmVkIGtleScpO1xuICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gZ2wpIHtcbiAgICBpZiAoZ2xba2V5XSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBgR0wuJHtrZXl9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy10by1rZXlzLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5leHBvcnQgZnVuY3Rpb24gZ2xGb3JtYXRUb0NvbXBvbmVudHMoZm9ybWF0KSB7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSA2NDA2OlxuICAgIGNhc2UgMzMzMjY6XG4gICAgY2FzZSA2NDAzOlxuICAgICAgcmV0dXJuIDE7XG5cbiAgICBjYXNlIDMzMzI4OlxuICAgIGNhc2UgMzMzMTk6XG4gICAgICByZXR1cm4gMjtcblxuICAgIGNhc2UgNjQwNzpcbiAgICBjYXNlIDM0ODM3OlxuICAgICAgcmV0dXJuIDM7XG5cbiAgICBjYXNlIDY0MDg6XG4gICAgY2FzZSAzNDgzNjpcbiAgICAgIHJldHVybiA0O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdsVHlwZVRvQnl0ZXModHlwZSkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIDUxMjE6XG4gICAgICByZXR1cm4gMTtcblxuICAgIGNhc2UgMzM2MzU6XG4gICAgY2FzZSAzMjgxOTpcbiAgICBjYXNlIDMyODIwOlxuICAgICAgcmV0dXJuIDI7XG5cbiAgICBjYXNlIDUxMjY6XG4gICAgICByZXR1cm4gNDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgcmV0dXJuIDA7XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcm1hdC11dGlscy5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykgOiBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRpbWVySWQpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA/IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aW1lcklkKSA6IGNsZWFyVGltZW91dCh0aW1lcklkKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlcXVlc3QtYW5pbWF0aW9uLWZyYW1lLmpzLm1hcCIsImltcG9ydCBUZXh0dXJlMkQgZnJvbSAnLi4vY2xhc3Nlcy90ZXh0dXJlLTJkJztcbmltcG9ydCBUZXh0dXJlQ3ViZSBmcm9tICcuLi9jbGFzc2VzL3RleHR1cmUtY3ViZSc7XG5pbXBvcnQgVGV4dHVyZTNEIGZyb20gJy4uL2NsYXNzZXMvdGV4dHVyZS0zZCc7XG5pbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi4vY2xhc3Nlcy9mcmFtZWJ1ZmZlcic7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lVGV4dHVyZUZyb20ocmVmVGV4dHVyZSwgb3ZlcnJpZGVzKSB7XG4gIGFzc2VydChyZWZUZXh0dXJlIGluc3RhbmNlb2YgVGV4dHVyZTJEIHx8IHJlZlRleHR1cmUgaW5zdGFuY2VvZiBUZXh0dXJlQ3ViZSB8fCByZWZUZXh0dXJlIGluc3RhbmNlb2YgVGV4dHVyZTNEKTtcbiAgY29uc3QgVGV4dHVyZVR5cGUgPSByZWZUZXh0dXJlLmNvbnN0cnVjdG9yO1xuICBjb25zdCB7XG4gICAgZ2wsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGZvcm1hdCxcbiAgICB0eXBlLFxuICAgIGRhdGFGb3JtYXQsXG4gICAgYm9yZGVyLFxuICAgIG1pcG1hcHNcbiAgfSA9IHJlZlRleHR1cmU7XG4gIGNvbnN0IHRleHR1cmVPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGZvcm1hdCxcbiAgICB0eXBlLFxuICAgIGRhdGFGb3JtYXQsXG4gICAgYm9yZGVyLFxuICAgIG1pcG1hcHNcbiAgfSwgb3ZlcnJpZGVzKTtcbiAgcmV0dXJuIG5ldyBUZXh0dXJlVHlwZShnbCwgdGV4dHVyZU9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvRnJhbWVidWZmZXIodGV4dHVyZSwgb3B0cykge1xuICBjb25zdCB7XG4gICAgZ2wsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGlkXG4gIH0gPSB0ZXh0dXJlO1xuICBjb25zdCBmcmFtZWJ1ZmZlciA9IG5ldyBGcmFtZWJ1ZmZlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgIGlkOiBgZnJhbWVidWZmZXItZm9yLSR7aWR9YCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgYXR0YWNobWVudHM6IHtcbiAgICAgIFszNjA2NF06IHRleHR1cmVcbiAgICB9XG4gIH0pKTtcbiAgcmV0dXJuIGZyYW1lYnVmZmVyO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGV4dHVyZS11dGlscy5qcy5tYXAiLCJjb25zdCBFUlJfVFlQRV9ERURVQ1RJT04gPSAnRmFpbGVkIHRvIGRlZHVjZSBHTCBjb25zdGFudCBmcm9tIHR5cGVkIGFycmF5JztcbmV4cG9ydCBmdW5jdGlvbiBnZXRHTFR5cGVGcm9tVHlwZWRBcnJheShhcnJheU9yVHlwZSkge1xuICBjb25zdCB0eXBlID0gQXJyYXlCdWZmZXIuaXNWaWV3KGFycmF5T3JUeXBlKSA/IGFycmF5T3JUeXBlLmNvbnN0cnVjdG9yIDogYXJyYXlPclR5cGU7XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBGbG9hdDMyQXJyYXk6XG4gICAgICByZXR1cm4gNTEyNjtcblxuICAgIGNhc2UgVWludDE2QXJyYXk6XG4gICAgICByZXR1cm4gNTEyMztcblxuICAgIGNhc2UgVWludDMyQXJyYXk6XG4gICAgICByZXR1cm4gNTEyNTtcblxuICAgIGNhc2UgVWludDhBcnJheTpcbiAgICAgIHJldHVybiA1MTIxO1xuXG4gICAgY2FzZSBVaW50OENsYW1wZWRBcnJheTpcbiAgICAgIHJldHVybiA1MTIxO1xuXG4gICAgY2FzZSBJbnQ4QXJyYXk6XG4gICAgICByZXR1cm4gNTEyMDtcblxuICAgIGNhc2UgSW50MTZBcnJheTpcbiAgICAgIHJldHVybiA1MTIyO1xuXG4gICAgY2FzZSBJbnQzMkFycmF5OlxuICAgICAgcmV0dXJuIDUxMjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKEVSUl9UWVBFX0RFRFVDVElPTik7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlZEFycmF5RnJvbUdMVHlwZShnbFR5cGUsIHtcbiAgY2xhbXBlZCA9IHRydWVcbn0gPSB7fSkge1xuICBzd2l0Y2ggKGdsVHlwZSkge1xuICAgIGNhc2UgNTEyNjpcbiAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7XG5cbiAgICBjYXNlIDUxMjM6XG4gICAgY2FzZSAzMzYzNTpcbiAgICBjYXNlIDMyODE5OlxuICAgIGNhc2UgMzI4MjA6XG4gICAgICByZXR1cm4gVWludDE2QXJyYXk7XG5cbiAgICBjYXNlIDUxMjU6XG4gICAgICByZXR1cm4gVWludDMyQXJyYXk7XG5cbiAgICBjYXNlIDUxMjE6XG4gICAgICByZXR1cm4gY2xhbXBlZCA/IFVpbnQ4Q2xhbXBlZEFycmF5IDogVWludDhBcnJheTtcblxuICAgIGNhc2UgNTEyMDpcbiAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG5cbiAgICBjYXNlIDUxMjI6XG4gICAgICByZXR1cm4gSW50MTZBcnJheTtcblxuICAgIGNhc2UgNTEyNDpcbiAgICAgIHJldHVybiBJbnQzMkFycmF5O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlZHVjZSB0eXBlZCBhcnJheSB0eXBlIGZyb20gR0wgY29uc3RhbnQnKTtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGZsaXBSb3dzKHtcbiAgZGF0YSxcbiAgd2lkdGgsXG4gIGhlaWdodCxcbiAgYnl0ZXNQZXJQaXhlbCA9IDQsXG4gIHRlbXBcbn0pIHtcbiAgY29uc3QgYnl0ZXNQZXJSb3cgPSB3aWR0aCAqIGJ5dGVzUGVyUGl4ZWw7XG4gIHRlbXAgPSB0ZW1wIHx8IG5ldyBVaW50OEFycmF5KGJ5dGVzUGVyUm93KTtcblxuICBmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodCAvIDI7ICsreSkge1xuICAgIGNvbnN0IHRvcE9mZnNldCA9IHkgKiBieXRlc1BlclJvdztcbiAgICBjb25zdCBib3R0b21PZmZzZXQgPSAoaGVpZ2h0IC0geSAtIDEpICogYnl0ZXNQZXJSb3c7XG4gICAgdGVtcC5zZXQoZGF0YS5zdWJhcnJheSh0b3BPZmZzZXQsIHRvcE9mZnNldCArIGJ5dGVzUGVyUm93KSk7XG4gICAgZGF0YS5jb3B5V2l0aGluKHRvcE9mZnNldCwgYm90dG9tT2Zmc2V0LCBib3R0b21PZmZzZXQgKyBieXRlc1BlclJvdyk7XG4gICAgZGF0YS5zZXQodGVtcCwgYm90dG9tT2Zmc2V0KTtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlUGl4ZWxzKHtcbiAgZGF0YSxcbiAgd2lkdGgsXG4gIGhlaWdodFxufSkge1xuICBjb25zdCBuZXdXaWR0aCA9IE1hdGgucm91bmQod2lkdGggLyAyKTtcbiAgY29uc3QgbmV3SGVpZ2h0ID0gTWF0aC5yb3VuZChoZWlnaHQgLyAyKTtcbiAgY29uc3QgbmV3RGF0YSA9IG5ldyBVaW50OEFycmF5KG5ld1dpZHRoICogbmV3SGVpZ2h0ICogNCk7XG5cbiAgZm9yIChsZXQgeSA9IDA7IHkgPCBuZXdIZWlnaHQ7IHkrKykge1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgbmV3V2lkdGg7IHgrKykge1xuICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCA0OyBjKyspIHtcbiAgICAgICAgbmV3RGF0YVsoeSAqIG5ld1dpZHRoICsgeCkgKiA0ICsgY10gPSBkYXRhWyh5ICogMiAqIHdpZHRoICsgeCAqIDIpICogNCArIGNdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGF0YTogbmV3RGF0YSxcbiAgICB3aWR0aDogbmV3V2lkdGgsXG4gICAgaGVpZ2h0OiBuZXdIZWlnaHRcbiAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR5cGVkLWFycmF5LXV0aWxzLmpzLm1hcCIsImV4cG9ydCB7IGRlZmF1bHQgYXMgU3RhdHMgfSBmcm9tICcuL2xpYi9zdGF0cyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFN0YXQgfSBmcm9tICcuL2xpYi9zdGF0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgX2dldEhpUmVzVGltZXN0YW1wIH0gZnJvbSAnLi91dGlscy9oaS1yZXMtdGltZXN0YW1wJztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCBnZXRIaVJlc1RpbWVzdGFtcCBmcm9tICcuLi91dGlscy9oaS1yZXMtdGltZXN0YW1wJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXQge1xuICBjb25zdHJ1Y3RvcihuYW1lLCB0eXBlKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuc2FtcGxlU2l6ZSA9IDE7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgc2V0U2FtcGxlU2l6ZShzYW1wbGVzKSB7XG4gICAgdGhpcy5zYW1wbGVTaXplID0gc2FtcGxlcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGluY3JlbWVudENvdW50KCkge1xuICAgIHRoaXMuYWRkQ291bnQoMSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZWNyZW1lbnRDb3VudCgpIHtcbiAgICB0aGlzLnN1YnRyYWN0Q291bnQoMSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRDb3VudCh2YWx1ZSkge1xuICAgIHRoaXMuX2NvdW50ICs9IHZhbHVlO1xuICAgIHRoaXMuX3NhbXBsZXMrKztcblxuICAgIHRoaXMuX2NoZWNrU2FtcGxpbmcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3VidHJhY3RDb3VudCh2YWx1ZSkge1xuICAgIHRoaXMuX2NvdW50IC09IHZhbHVlO1xuICAgIHRoaXMuX3NhbXBsZXMrKztcblxuICAgIHRoaXMuX2NoZWNrU2FtcGxpbmcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVGltZSh0aW1lKSB7XG4gICAgdGhpcy5fdGltZSArPSB0aW1lO1xuICAgIHRoaXMubGFzdFRpbWluZyA9IHRpbWU7XG4gICAgdGhpcy5fc2FtcGxlcysrO1xuXG4gICAgdGhpcy5fY2hlY2tTYW1wbGluZygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aW1lU3RhcnQoKSB7XG4gICAgdGhpcy5fc3RhcnRUaW1lID0gZ2V0SGlSZXNUaW1lc3RhbXAoKTtcbiAgICB0aGlzLl90aW1lclBlbmRpbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGltZUVuZCgpIHtcbiAgICBpZiAoIXRoaXMuX3RpbWVyUGVuZGluZykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5hZGRUaW1lKGdldEhpUmVzVGltZXN0YW1wKCkgLSB0aGlzLl9zdGFydFRpbWUpO1xuICAgIHRoaXMuX3RpbWVyUGVuZGluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fY2hlY2tTYW1wbGluZygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRTYW1wbGVBdmVyYWdlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtcGxlU2l6ZSA+IDAgPyB0aGlzLmxhc3RTYW1wbGVDb3VudCAvIHRoaXMuc2FtcGxlU2l6ZSA6IDA7XG4gIH1cblxuICBnZXRTYW1wbGVBdmVyYWdlVGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zYW1wbGVTaXplID4gMCA/IHRoaXMubGFzdFNhbXBsZVRpbWUgLyB0aGlzLnNhbXBsZVNpemUgOiAwO1xuICB9XG5cbiAgZ2V0U2FtcGxlSHooKSB7XG4gICAgcmV0dXJuIHRoaXMubGFzdFNhbXBsZVRpbWUgPiAwID8gdGhpcy5zYW1wbGVTaXplIC8gKHRoaXMubGFzdFNhbXBsZVRpbWUgLyAxMDAwKSA6IDA7XG4gIH1cblxuICBnZXRBdmVyYWdlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtcGxlcyA+IDAgPyB0aGlzLmNvdW50IC8gdGhpcy5zYW1wbGVzIDogMDtcbiAgfVxuXG4gIGdldEF2ZXJhZ2VUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLnNhbXBsZXMgPiAwID8gdGhpcy50aW1lIC8gdGhpcy5zYW1wbGVzIDogMDtcbiAgfVxuXG4gIGdldEh6KCkge1xuICAgIHJldHVybiB0aGlzLnRpbWUgPiAwID8gdGhpcy5zYW1wbGVzIC8gKHRoaXMudGltZSAvIDEwMDApIDogMDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy5jb3VudCA9IDA7XG4gICAgdGhpcy5zYW1wbGVzID0gMDtcbiAgICB0aGlzLmxhc3RUaW1pbmcgPSAwO1xuICAgIHRoaXMubGFzdFNhbXBsZVRpbWUgPSAwO1xuICAgIHRoaXMubGFzdFNhbXBsZUNvdW50ID0gMDtcbiAgICB0aGlzLl9jb3VudCA9IDA7XG4gICAgdGhpcy5fdGltZSA9IDA7XG4gICAgdGhpcy5fc2FtcGxlcyA9IDA7XG4gICAgdGhpcy5fc3RhcnRUaW1lID0gMDtcbiAgICB0aGlzLl90aW1lclBlbmRpbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9jaGVja1NhbXBsaW5nKCkge1xuICAgIGlmICh0aGlzLl9zYW1wbGVzID09PSB0aGlzLnNhbXBsZVNpemUpIHtcbiAgICAgIHRoaXMubGFzdFNhbXBsZVRpbWUgPSB0aGlzLl90aW1lO1xuICAgICAgdGhpcy5sYXN0U2FtcGxlQ291bnQgPSB0aGlzLl9jb3VudDtcbiAgICAgIHRoaXMuY291bnQgKz0gdGhpcy5fY291bnQ7XG4gICAgICB0aGlzLnRpbWUgKz0gdGhpcy5fdGltZTtcbiAgICAgIHRoaXMuc2FtcGxlcyArPSB0aGlzLl9zYW1wbGVzO1xuICAgICAgdGhpcy5fdGltZSA9IDA7XG4gICAgICB0aGlzLl9jb3VudCA9IDA7XG4gICAgICB0aGlzLl9zYW1wbGVzID0gMDtcbiAgICB9XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdC5qcy5tYXAiLCJpbXBvcnQgU3RhdCBmcm9tICcuL3N0YXQnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgaWQsXG4gICAgc3RhdHNcbiAgfSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnN0YXRzID0ge307XG5cbiAgICB0aGlzLl9pbml0aWFsaXplU3RhdHMoc3RhdHMpO1xuXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBnZXQobmFtZSwgdHlwZSA9ICdjb3VudCcpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0T3JDcmVhdGUoe1xuICAgICAgbmFtZSxcbiAgICAgIHR5cGVcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnN0YXRzKS5sZW5ndGg7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLnN0YXRzKSB7XG4gICAgICB0aGlzLnN0YXRzW2tleV0ucmVzZXQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZvckVhY2goZm4pIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLnN0YXRzKSB7XG4gICAgICBmbih0aGlzLnN0YXRzW2tleV0pO1xuICAgIH1cbiAgfVxuXG4gIGdldFRhYmxlKCkge1xuICAgIGNvbnN0IHRhYmxlID0ge307XG4gICAgdGhpcy5mb3JFYWNoKHN0YXQgPT4ge1xuICAgICAgdGFibGVbc3RhdC5uYW1lXSA9IHtcbiAgICAgICAgdGltZTogc3RhdC50aW1lIHx8IDAsXG4gICAgICAgIGNvdW50OiBzdGF0LmNvdW50IHx8IDAsXG4gICAgICAgIGF2ZXJhZ2U6IHN0YXQuZ2V0QXZlcmFnZVRpbWUoKSB8fCAwLFxuICAgICAgICBoejogc3RhdC5nZXRIeigpIHx8IDBcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHRhYmxlO1xuICB9XG5cbiAgX2luaXRpYWxpemVTdGF0cyhzdGF0cyA9IFtdKSB7XG4gICAgc3RhdHMuZm9yRWFjaChzdGF0ID0+IHRoaXMuX2dldE9yQ3JlYXRlKHN0YXQpKTtcbiAgfVxuXG4gIF9nZXRPckNyZWF0ZShzdGF0KSB7XG4gICAgaWYgKCFzdGF0IHx8ICFzdGF0Lm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIG5hbWUsXG4gICAgICB0eXBlXG4gICAgfSA9IHN0YXQ7XG5cbiAgICBpZiAoIXRoaXMuc3RhdHNbbmFtZV0pIHtcbiAgICAgIGlmIChzdGF0IGluc3RhbmNlb2YgU3RhdCkge1xuICAgICAgICB0aGlzLnN0YXRzW25hbWVdID0gc3RhdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3RhdHNbbmFtZV0gPSBuZXcgU3RhdChuYW1lLCB0eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0c1tuYW1lXTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGF0cy5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRIaVJlc1RpbWVzdGFtcCgpIHtcbiAgbGV0IHRpbWVzdGFtcDtcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnBlcmZvcm1hbmNlKSB7XG4gICAgdGltZXN0YW1wID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIGNvbnN0IHRpbWVQYXJ0cyA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gICAgdGltZXN0YW1wID0gdGltZVBhcnRzWzBdICogMTAwMCArIHRpbWVQYXJ0c1sxXSAvIDFlNjtcbiAgfSBlbHNlIHtcbiAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICB9XG5cbiAgcmV0dXJuIHRpbWVzdGFtcDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhpLXJlcy10aW1lc3RhbXAuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5pc01vYmlsZSA9IGlzTW9iaWxlO1xuZXhwb3J0cy5kZWZhdWx0ID0gZ2V0QnJvd3NlcjtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZShcIi4vZ2xvYmFsc1wiKTtcblxudmFyIF9pc0Jyb3dzZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzLWJyb3dzZXJcIikpO1xuXG52YXIgX2lzRWxlY3Ryb24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzLWVsZWN0cm9uXCIpKTtcblxuZnVuY3Rpb24gaXNNb2JpbGUoKSB7XG4gIHJldHVybiB0eXBlb2YgX2dsb2JhbHMud2luZG93Lm9yaWVudGF0aW9uICE9PSAndW5kZWZpbmVkJztcbn1cblxuZnVuY3Rpb24gZ2V0QnJvd3Nlcihtb2NrVXNlckFnZW50KSB7XG4gIGlmICghbW9ja1VzZXJBZ2VudCAmJiAhKDAsIF9pc0Jyb3dzZXIuZGVmYXVsdCkoKSkge1xuICAgIHJldHVybiAnTm9kZSc7XG4gIH1cblxuICBpZiAoKDAsIF9pc0VsZWN0cm9uLmRlZmF1bHQpKG1vY2tVc2VyQWdlbnQpKSB7XG4gICAgcmV0dXJuICdFbGVjdHJvbic7XG4gIH1cblxuICB2YXIgbmF2aWdhdG9yXyA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yIDoge307XG4gIHZhciB1c2VyQWdlbnQgPSBtb2NrVXNlckFnZW50IHx8IG5hdmlnYXRvcl8udXNlckFnZW50IHx8ICcnO1xuXG4gIGlmICh1c2VyQWdlbnQuaW5kZXhPZignRWRnZScpID4gLTEpIHtcbiAgICByZXR1cm4gJ0VkZ2UnO1xuICB9XG5cbiAgdmFyIGlzTVNJRSA9IHVzZXJBZ2VudC5pbmRleE9mKCdNU0lFICcpICE9PSAtMTtcbiAgdmFyIGlzVHJpZGVudCA9IHVzZXJBZ2VudC5pbmRleE9mKCdUcmlkZW50LycpICE9PSAtMTtcblxuICBpZiAoaXNNU0lFIHx8IGlzVHJpZGVudCkge1xuICAgIHJldHVybiAnSUUnO1xuICB9XG5cbiAgaWYgKF9nbG9iYWxzLndpbmRvdy5jaHJvbWUpIHtcbiAgICByZXR1cm4gJ0Nocm9tZSc7XG4gIH1cblxuICBpZiAoX2dsb2JhbHMud2luZG93LnNhZmFyaSkge1xuICAgIHJldHVybiAnU2FmYXJpJztcbiAgfVxuXG4gIGlmIChfZ2xvYmFscy53aW5kb3cubW96SW5uZXJTY3JlZW5YKSB7XG4gICAgcmV0dXJuICdGaXJlZm94JztcbiAgfVxuXG4gIHJldHVybiAnVW5rbm93bic7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXQtYnJvd3Nlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNvbnNvbGUgPSBleHBvcnRzLnByb2Nlc3MgPSBleHBvcnRzLmRvY3VtZW50ID0gZXhwb3J0cy5nbG9iYWwgPSBleHBvcnRzLndpbmRvdyA9IGV4cG9ydHMuc2VsZiA9IHZvaWQgMDtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgZ2xvYmFscyA9IHtcbiAgc2VsZjogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmIHNlbGYsXG4gIHdpbmRvdzogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LFxuICBnbG9iYWw6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbCxcbiAgZG9jdW1lbnQ6IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQsXG4gIHByb2Nlc3M6ICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjIuZGVmYXVsdCkocHJvY2VzcykpID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzXG59O1xudmFyIHNlbGZfID0gZ2xvYmFscy5zZWxmIHx8IGdsb2JhbHMud2luZG93IHx8IGdsb2JhbHMuZ2xvYmFsO1xuZXhwb3J0cy5zZWxmID0gc2VsZl87XG52YXIgd2luZG93XyA9IGdsb2JhbHMud2luZG93IHx8IGdsb2JhbHMuc2VsZiB8fCBnbG9iYWxzLmdsb2JhbDtcbmV4cG9ydHMud2luZG93ID0gd2luZG93XztcbnZhciBnbG9iYWxfID0gZ2xvYmFscy5nbG9iYWwgfHwgZ2xvYmFscy5zZWxmIHx8IGdsb2JhbHMud2luZG93O1xuZXhwb3J0cy5nbG9iYWwgPSBnbG9iYWxfO1xudmFyIGRvY3VtZW50XyA9IGdsb2JhbHMuZG9jdW1lbnQgfHwge307XG5leHBvcnRzLmRvY3VtZW50ID0gZG9jdW1lbnRfO1xudmFyIHByb2Nlc3NfID0gZ2xvYmFscy5wcm9jZXNzIHx8IHt9O1xuZXhwb3J0cy5wcm9jZXNzID0gcHJvY2Vzc187XG52YXIgY29uc29sZV8gPSBjb25zb2xlO1xuZXhwb3J0cy5jb25zb2xlID0gY29uc29sZV87XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxudmFyIF90eXBlb2YgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJzZWxmXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nbG9iYWxzLnNlbGY7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwid2luZG93XCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nbG9iYWxzLndpbmRvdztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnbG9iYWxcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMuZ2xvYmFsO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImRvY3VtZW50XCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nbG9iYWxzLmRvY3VtZW50O1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInByb2Nlc3NcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMucHJvY2VzcztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJjb25zb2xlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nbG9iYWxzLmNvbnNvbGU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaXNCcm93c2VyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9pc0Jyb3dzZXIuZGVmYXVsdDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJpc0Jyb3dzZXJNYWluVGhyZWFkXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9pc0Jyb3dzZXIuaXNCcm93c2VyTWFpblRocmVhZDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnZXRCcm93c2VyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nZXRCcm93c2VyLmRlZmF1bHQ7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaXNNb2JpbGVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dldEJyb3dzZXIuaXNNb2JpbGU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaXNFbGVjdHJvblwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfaXNFbGVjdHJvbi5kZWZhdWx0O1xuICB9XG59KTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZShcIi4vZ2xvYmFsc1wiKTtcblxudmFyIF9pc0Jyb3dzZXIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9pcy1icm93c2VyXCIpKTtcblxudmFyIF9nZXRCcm93c2VyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQocmVxdWlyZShcIi4vZ2V0LWJyb3dzZXJcIikpO1xuXG52YXIgX2lzRWxlY3Ryb24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzLWVsZWN0cm9uXCIpKTtcblxuZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKG5vZGVJbnRlcm9wKSB7IGlmICh0eXBlb2YgV2Vha01hcCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDsgdmFyIGNhY2hlQmFiZWxJbnRlcm9wID0gbmV3IFdlYWtNYXAoKTsgdmFyIGNhY2hlTm9kZUludGVyb3AgPSBuZXcgV2Vha01hcCgpOyByZXR1cm4gKF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSA9IGZ1bmN0aW9uIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZShub2RlSW50ZXJvcCkgeyByZXR1cm4gbm9kZUludGVyb3AgPyBjYWNoZU5vZGVJbnRlcm9wIDogY2FjaGVCYWJlbEludGVyb3A7IH0pKG5vZGVJbnRlcm9wKTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmosIG5vZGVJbnRlcm9wKSB7IGlmICghbm9kZUludGVyb3AgJiYgb2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gaWYgKG9iaiA9PT0gbnVsbCB8fCBfdHlwZW9mKG9iaikgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iaiAhPT0gXCJmdW5jdGlvblwiKSB7IHJldHVybiB7IGRlZmF1bHQ6IG9iaiB9OyB9IHZhciBjYWNoZSA9IF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZShub2RlSW50ZXJvcCk7IGlmIChjYWNoZSAmJiBjYWNoZS5oYXMob2JqKSkgeyByZXR1cm4gY2FjaGUuZ2V0KG9iaik7IH0gdmFyIG5ld09iaiA9IHt9OyB2YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKGtleSAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgeyB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvciA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpIDogbnVsbDsgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpOyB9IGVsc2UgeyBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgaWYgKGNhY2hlKSB7IGNhY2hlLnNldChvYmosIG5ld09iaik7IH0gcmV0dXJuIG5ld09iajsgfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNCcm93c2VyO1xuZXhwb3J0cy5pc0Jyb3dzZXJNYWluVGhyZWFkID0gaXNCcm93c2VyTWFpblRocmVhZDtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2lzRWxlY3Ryb24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzLWVsZWN0cm9uXCIpKTtcblxuZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICB2YXIgaXNOb2RlID0gKHR5cGVvZiBwcm9jZXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMi5kZWZhdWx0KShwcm9jZXNzKSkgPT09ICdvYmplY3QnICYmIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmICFwcm9jZXNzLmJyb3dzZXI7XG4gIHJldHVybiAhaXNOb2RlIHx8ICgwLCBfaXNFbGVjdHJvbi5kZWZhdWx0KSgpO1xufVxuXG5mdW5jdGlvbiBpc0Jyb3dzZXJNYWluVGhyZWFkKCkge1xuICByZXR1cm4gaXNCcm93c2VyKCkgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzLWJyb3dzZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNFbGVjdHJvbjtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG5mdW5jdGlvbiBpc0VsZWN0cm9uKG1vY2tVc2VyQWdlbnQpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICgwLCBfdHlwZW9mMi5kZWZhdWx0KSh3aW5kb3cucHJvY2VzcykgPT09ICdvYmplY3QnICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgKDAsIF90eXBlb2YyLmRlZmF1bHQpKHByb2Nlc3MudmVyc2lvbnMpID09PSAnb2JqZWN0JyAmJiBCb29sZWFuKHByb2Nlc3MudmVyc2lvbnMuZWxlY3Ryb24pKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgcmVhbFVzZXJBZ2VudCA9ICh0eXBlb2YgbmF2aWdhdG9yID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMi5kZWZhdWx0KShuYXZpZ2F0b3IpKSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG5hdmlnYXRvci51c2VyQWdlbnQgPT09ICdzdHJpbmcnICYmIG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciB1c2VyQWdlbnQgPSBtb2NrVXNlckFnZW50IHx8IHJlYWxVc2VyQWdlbnQ7XG5cbiAgaWYgKHVzZXJBZ2VudCAmJiB1c2VyQWdlbnQuaW5kZXhPZignRWxlY3Ryb24nKSA+PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy1lbGVjdHJvbi5qcy5tYXAiLCJpbXBvcnQgeyB3aW5kb3cgfSBmcm9tICcuL2dsb2JhbHMnO1xuaW1wb3J0IGlzQnJvd3NlciBmcm9tICcuL2lzLWJyb3dzZXInO1xuaW1wb3J0IGlzRWxlY3Ryb24gZnJvbSAnLi9pcy1lbGVjdHJvbic7XG5leHBvcnQgZnVuY3Rpb24gaXNNb2JpbGUoKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93Lm9yaWVudGF0aW9uICE9PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEJyb3dzZXIobW9ja1VzZXJBZ2VudCkge1xuICBpZiAoIW1vY2tVc2VyQWdlbnQgJiYgIWlzQnJvd3NlcigpKSB7XG4gICAgcmV0dXJuICdOb2RlJztcbiAgfVxuXG4gIGlmIChpc0VsZWN0cm9uKG1vY2tVc2VyQWdlbnQpKSB7XG4gICAgcmV0dXJuICdFbGVjdHJvbic7XG4gIH1cblxuICBjb25zdCBuYXZpZ2F0b3JfID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IgOiB7fTtcbiAgY29uc3QgdXNlckFnZW50ID0gbW9ja1VzZXJBZ2VudCB8fCBuYXZpZ2F0b3JfLnVzZXJBZ2VudCB8fCAnJztcblxuICBpZiAodXNlckFnZW50LmluZGV4T2YoJ0VkZ2UnKSA+IC0xKSB7XG4gICAgcmV0dXJuICdFZGdlJztcbiAgfVxuXG4gIGNvbnN0IGlzTVNJRSA9IHVzZXJBZ2VudC5pbmRleE9mKCdNU0lFICcpICE9PSAtMTtcbiAgY29uc3QgaXNUcmlkZW50ID0gdXNlckFnZW50LmluZGV4T2YoJ1RyaWRlbnQvJykgIT09IC0xO1xuXG4gIGlmIChpc01TSUUgfHwgaXNUcmlkZW50KSB7XG4gICAgcmV0dXJuICdJRSc7XG4gIH1cblxuICBpZiAod2luZG93LmNocm9tZSkge1xuICAgIHJldHVybiAnQ2hyb21lJztcbiAgfVxuXG4gIGlmICh3aW5kb3cuc2FmYXJpKSB7XG4gICAgcmV0dXJuICdTYWZhcmknO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5tb3pJbm5lclNjcmVlblgpIHtcbiAgICByZXR1cm4gJ0ZpcmVmb3gnO1xuICB9XG5cbiAgcmV0dXJuICdVbmtub3duJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldC1icm93c2VyLmpzLm1hcCIsImNvbnN0IGdsb2JhbHMgPSB7XG4gIHNlbGY6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmLFxuICB3aW5kb3c6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyxcbiAgZ2xvYmFsOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwsXG4gIGRvY3VtZW50OiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LFxuICBwcm9jZXNzOiB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgcHJvY2Vzc1xufTtcbmNvbnN0IHNlbGZfID0gZ2xvYmFscy5zZWxmIHx8IGdsb2JhbHMud2luZG93IHx8IGdsb2JhbHMuZ2xvYmFsO1xuY29uc3Qgd2luZG93XyA9IGdsb2JhbHMud2luZG93IHx8IGdsb2JhbHMuc2VsZiB8fCBnbG9iYWxzLmdsb2JhbDtcbmNvbnN0IGdsb2JhbF8gPSBnbG9iYWxzLmdsb2JhbCB8fCBnbG9iYWxzLnNlbGYgfHwgZ2xvYmFscy53aW5kb3c7XG5jb25zdCBkb2N1bWVudF8gPSBnbG9iYWxzLmRvY3VtZW50IHx8IHt9O1xuY29uc3QgcHJvY2Vzc18gPSBnbG9iYWxzLnByb2Nlc3MgfHwge307XG5jb25zdCBjb25zb2xlXyA9IGNvbnNvbGU7XG5leHBvcnQgeyBzZWxmXyBhcyBzZWxmLCB3aW5kb3dfIGFzIHdpbmRvdywgZ2xvYmFsXyBhcyBnbG9iYWwsIGRvY3VtZW50XyBhcyBkb2N1bWVudCwgcHJvY2Vzc18gYXMgcHJvY2VzcywgY29uc29sZV8gYXMgY29uc29sZSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2xvYmFscy5qcy5tYXAiLCJpbXBvcnQgaXNFbGVjdHJvbiBmcm9tICcuL2lzLWVsZWN0cm9uJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzQnJvd3NlcigpIHtcbiAgY29uc3QgaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmICFwcm9jZXNzLmJyb3dzZXI7XG4gIHJldHVybiAhaXNOb2RlIHx8IGlzRWxlY3Ryb24oKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0Jyb3dzZXJNYWluVGhyZWFkKCkge1xuICByZXR1cm4gaXNCcm93c2VyKCkgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzLWJyb3dzZXIuanMubWFwIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNFbGVjdHJvbihtb2NrVXNlckFnZW50KSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgPT09ICdvYmplY3QnICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMgPT09ICdvYmplY3QnICYmIEJvb2xlYW4ocHJvY2Vzcy52ZXJzaW9ucy5lbGVjdHJvbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IHJlYWxVc2VyQWdlbnQgPSB0eXBlb2YgbmF2aWdhdG9yID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbmF2aWdhdG9yLnVzZXJBZ2VudCA9PT0gJ3N0cmluZycgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgY29uc3QgdXNlckFnZW50ID0gbW9ja1VzZXJBZ2VudCB8fCByZWFsVXNlckFnZW50O1xuXG4gIGlmICh1c2VyQWdlbnQgJiYgdXNlckFnZW50LmluZGV4T2YoJ0VsZWN0cm9uJykgPj0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMtZWxlY3Ryb24uanMubWFwIiwiaW1wb3J0IHsgVkVSU0lPTiwgaXNCcm93c2VyIH0gZnJvbSAnLi4vdXRpbHMvZ2xvYmFscyc7XG5pbXBvcnQgTG9jYWxTdG9yYWdlIGZyb20gJy4uL3V0aWxzL2xvY2FsLXN0b3JhZ2UnO1xuaW1wb3J0IHsgZm9ybWF0SW1hZ2UsIGZvcm1hdFRpbWUsIGxlZnRQYWQgfSBmcm9tICcuLi91dGlscy9mb3JtYXR0ZXJzJztcbmltcG9ydCB7IGFkZENvbG9yIH0gZnJvbSAnLi4vdXRpbHMvY29sb3InO1xuaW1wb3J0IHsgYXV0b2JpbmQgfSBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgZ2V0SGlSZXNUaW1lc3RhbXAgZnJvbSAnLi4vdXRpbHMvaGktcmVzLXRpbWVzdGFtcCc7XG5jb25zdCBvcmlnaW5hbENvbnNvbGUgPSB7XG4gIGRlYnVnOiBpc0Jyb3dzZXIgPyBjb25zb2xlLmRlYnVnIHx8IGNvbnNvbGUubG9nIDogY29uc29sZS5sb2csXG4gIGxvZzogY29uc29sZS5sb2csXG4gIGluZm86IGNvbnNvbGUuaW5mbyxcbiAgd2FybjogY29uc29sZS53YXJuLFxuICBlcnJvcjogY29uc29sZS5lcnJvclxufTtcbmNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XG4gIGVuYWJsZWQ6IHRydWUsXG4gIGxldmVsOiAwXG59O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgY2FjaGUgPSB7fTtcbmNvbnN0IE9OQ0UgPSB7XG4gIG9uY2U6IHRydWVcbn07XG5cbmZ1bmN0aW9uIGdldFRhYmxlSGVhZGVyKHRhYmxlKSB7XG4gIGZvciAoY29uc3Qga2V5IGluIHRhYmxlKSB7XG4gICAgZm9yIChjb25zdCB0aXRsZSBpbiB0YWJsZVtrZXldKSB7XG4gICAgICByZXR1cm4gdGl0bGUgfHwgJ3VudGl0bGVkJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJ2VtcHR5Jztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGlkXG4gIH0gPSB7XG4gICAgaWQ6ICcnXG4gIH0pIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5WRVJTSU9OID0gVkVSU0lPTjtcbiAgICB0aGlzLl9zdGFydFRzID0gZ2V0SGlSZXNUaW1lc3RhbXAoKTtcbiAgICB0aGlzLl9kZWx0YVRzID0gZ2V0SGlSZXNUaW1lc3RhbXAoKTtcbiAgICB0aGlzLkxPR19USFJPVFRMRV9USU1FT1VUID0gMDtcbiAgICB0aGlzLl9zdG9yYWdlID0gbmV3IExvY2FsU3RvcmFnZShcIl9fcHJvYmUtXCIuY29uY2F0KHRoaXMuaWQsIFwiX19cIiksIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHRoaXMudXNlckRhdGEgPSB7fTtcbiAgICB0aGlzLnRpbWVTdGFtcChcIlwiLmNvbmNhdCh0aGlzLmlkLCBcIiBzdGFydGVkXCIpKTtcbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIHNldCBsZXZlbChuZXdMZXZlbCkge1xuICAgIHRoaXMuc2V0TGV2ZWwobmV3TGV2ZWwpO1xuICB9XG5cbiAgZ2V0IGxldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmdldExldmVsKCk7XG4gIH1cblxuICBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2UuY29uZmlnLmVuYWJsZWQ7XG4gIH1cblxuICBnZXRMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmFnZS5jb25maWcubGV2ZWw7XG4gIH1cblxuICBnZXRUb3RhbCgpIHtcbiAgICByZXR1cm4gTnVtYmVyKChnZXRIaVJlc1RpbWVzdGFtcCgpIC0gdGhpcy5fc3RhcnRUcykudG9QcmVjaXNpb24oMTApKTtcbiAgfVxuXG4gIGdldERlbHRhKCkge1xuICAgIHJldHVybiBOdW1iZXIoKGdldEhpUmVzVGltZXN0YW1wKCkgLSB0aGlzLl9kZWx0YVRzKS50b1ByZWNpc2lvbigxMCkpO1xuICB9XG5cbiAgc2V0IHByaW9yaXR5KG5ld1ByaW9yaXR5KSB7XG4gICAgdGhpcy5sZXZlbCA9IG5ld1ByaW9yaXR5O1xuICB9XG5cbiAgZ2V0IHByaW9yaXR5KCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsO1xuICB9XG5cbiAgZ2V0UHJpb3JpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWw7XG4gIH1cblxuICBlbmFibGUoZW5hYmxlZCA9IHRydWUpIHtcbiAgICB0aGlzLl9zdG9yYWdlLnVwZGF0ZUNvbmZpZ3VyYXRpb24oe1xuICAgICAgZW5hYmxlZFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRMZXZlbChsZXZlbCkge1xuICAgIHRoaXMuX3N0b3JhZ2UudXBkYXRlQ29uZmlndXJhdGlvbih7XG4gICAgICBsZXZlbFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gICAgYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSk7XG4gIH1cblxuICB3YXJuKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24oMCwgbWVzc2FnZSwgb3JpZ2luYWxDb25zb2xlLndhcm4sIGFyZ3VtZW50cywgT05DRSk7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKDAsIG1lc3NhZ2UsIG9yaWdpbmFsQ29uc29sZS5lcnJvciwgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGRlcHJlY2F0ZWQob2xkVXNhZ2UsIG5ld1VzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMud2FybihcImBcIi5jb25jYXQob2xkVXNhZ2UsIFwiYCBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gYSBsYXRlciB2ZXJzaW9uLiBVc2UgYFwiKS5jb25jYXQobmV3VXNhZ2UsIFwiYCBpbnN0ZWFkXCIpKTtcbiAgfVxuXG4gIHJlbW92ZWQob2xkVXNhZ2UsIG5ld1VzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoXCJgXCIuY29uY2F0KG9sZFVzYWdlLCBcImAgaGFzIGJlZW4gcmVtb3ZlZC4gVXNlIGBcIikuY29uY2F0KG5ld1VzYWdlLCBcImAgaW5zdGVhZFwiKSk7XG4gIH1cblxuICBwcm9iZShsb2dMZXZlbCwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgbWVzc2FnZSwgb3JpZ2luYWxDb25zb2xlLmxvZywgYXJndW1lbnRzLCB7XG4gICAgICB0aW1lOiB0cnVlLFxuICAgICAgb25jZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgbG9nKGxvZ0xldmVsLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCBtZXNzYWdlLCBvcmlnaW5hbENvbnNvbGUuZGVidWcsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBpbmZvKGxvZ0xldmVsLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCBtZXNzYWdlLCBjb25zb2xlLmluZm8sIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbmNlKGxvZ0xldmVsLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCBtZXNzYWdlLCBvcmlnaW5hbENvbnNvbGUuZGVidWcgfHwgb3JpZ2luYWxDb25zb2xlLmluZm8sIGFyZ3VtZW50cywgT05DRSk7XG4gIH1cblxuICB0YWJsZShsb2dMZXZlbCwgdGFibGUsIGNvbHVtbnMpIHtcbiAgICBpZiAodGFibGUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgdGFibGUsIGNvbnNvbGUudGFibGUgfHwgbm9vcCwgY29sdW1ucyAmJiBbY29sdW1uc10sIHtcbiAgICAgICAgdGFnOiBnZXRUYWJsZUhlYWRlcih0YWJsZSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBub29wO1xuICB9XG5cbiAgaW1hZ2Uoe1xuICAgIGxvZ0xldmVsLFxuICAgIHByaW9yaXR5LFxuICAgIGltYWdlLFxuICAgIG1lc3NhZ2UgPSAnJyxcbiAgICBzY2FsZSA9IDFcbiAgfSkge1xuICAgIGlmICghdGhpcy5fc2hvdWxkTG9nKGxvZ0xldmVsIHx8IHByaW9yaXR5KSkge1xuICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlzQnJvd3NlciA/IGxvZ0ltYWdlSW5Ccm93c2VyKHtcbiAgICAgIGltYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHNjYWxlXG4gICAgfSkgOiBsb2dJbWFnZUluTm9kZSh7XG4gICAgICBpbWFnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBzY2FsZVxuICAgIH0pO1xuICB9XG5cbiAgc2V0dGluZ3MoKSB7XG4gICAgaWYgKGNvbnNvbGUudGFibGUpIHtcbiAgICAgIGNvbnNvbGUudGFibGUodGhpcy5fc3RvcmFnZS5jb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLl9zdG9yYWdlLmNvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0KHNldHRpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmFnZS5jb25maWdbc2V0dGluZ107XG4gIH1cblxuICBzZXQoc2V0dGluZywgdmFsdWUpIHtcbiAgICB0aGlzLl9zdG9yYWdlLnVwZGF0ZUNvbmZpZ3VyYXRpb24oe1xuICAgICAgW3NldHRpbmddOiB2YWx1ZVxuICAgIH0pO1xuICB9XG5cbiAgdGltZShsb2dMZXZlbCwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgbWVzc2FnZSwgY29uc29sZS50aW1lID8gY29uc29sZS50aW1lIDogY29uc29sZS5pbmZvKTtcbiAgfVxuXG4gIHRpbWVFbmQobG9nTGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIGNvbnNvbGUudGltZUVuZCA/IGNvbnNvbGUudGltZUVuZCA6IGNvbnNvbGUuaW5mbyk7XG4gIH1cblxuICB0aW1lU3RhbXAobG9nTGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIGNvbnNvbGUudGltZVN0YW1wIHx8IG5vb3ApO1xuICB9XG5cbiAgZ3JvdXAobG9nTGV2ZWwsIG1lc3NhZ2UsIG9wdHMgPSB7XG4gICAgY29sbGFwc2VkOiBmYWxzZVxuICB9KSB7XG4gICAgb3B0cyA9IG5vcm1hbGl6ZUFyZ3VtZW50cyh7XG4gICAgICBsb2dMZXZlbCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBvcHRzXG4gICAgfSk7XG4gICAgY29uc3Qge1xuICAgICAgY29sbGFwc2VkXG4gICAgfSA9IG9wdHM7XG4gICAgb3B0cy5tZXRob2QgPSAoY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXApIHx8IGNvbnNvbGUuaW5mbztcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24ob3B0cyk7XG4gIH1cblxuICBncm91cENvbGxhcHNlZChsb2dMZXZlbCwgbWVzc2FnZSwgb3B0cyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAobG9nTGV2ZWwsIG1lc3NhZ2UsIE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZVxuICAgIH0pKTtcbiAgfVxuXG4gIGdyb3VwRW5kKGxvZ0xldmVsKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCAnJywgY29uc29sZS5ncm91cEVuZCB8fCBub29wKTtcbiAgfVxuXG4gIHdpdGhHcm91cChsb2dMZXZlbCwgbWVzc2FnZSwgZnVuYykge1xuICAgIHRoaXMuZ3JvdXAobG9nTGV2ZWwsIG1lc3NhZ2UpKCk7XG5cbiAgICB0cnkge1xuICAgICAgZnVuYygpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmdyb3VwRW5kKGxvZ0xldmVsKSgpO1xuICAgIH1cbiAgfVxuXG4gIHRyYWNlKCkge1xuICAgIGlmIChjb25zb2xlLnRyYWNlKSB7XG4gICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgX3Nob3VsZExvZyhsb2dMZXZlbCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCgpICYmIHRoaXMuZ2V0TGV2ZWwoKSA+PSBub3JtYWxpemVMb2dMZXZlbChsb2dMZXZlbCk7XG4gIH1cblxuICBfZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIG1ldGhvZCwgYXJncyA9IFtdLCBvcHRzKSB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZExvZyhsb2dMZXZlbCkpIHtcbiAgICAgIG9wdHMgPSBub3JtYWxpemVBcmd1bWVudHMoe1xuICAgICAgICBsb2dMZXZlbCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0c1xuICAgICAgfSk7XG4gICAgICBtZXRob2QgPSBtZXRob2QgfHwgb3B0cy5tZXRob2Q7XG4gICAgICBhc3NlcnQobWV0aG9kKTtcbiAgICAgIG9wdHMudG90YWwgPSB0aGlzLmdldFRvdGFsKCk7XG4gICAgICBvcHRzLmRlbHRhID0gdGhpcy5nZXREZWx0YSgpO1xuICAgICAgdGhpcy5fZGVsdGFUcyA9IGdldEhpUmVzVGltZXN0YW1wKCk7XG4gICAgICBjb25zdCB0YWcgPSBvcHRzLnRhZyB8fCBvcHRzLm1lc3NhZ2U7XG5cbiAgICAgIGlmIChvcHRzLm9uY2UpIHtcbiAgICAgICAgaWYgKCFjYWNoZVt0YWddKSB7XG4gICAgICAgICAgY2FjaGVbdGFnXSA9IGdldEhpUmVzVGltZXN0YW1wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWVzc2FnZSA9IGRlY29yYXRlTWVzc2FnZSh0aGlzLmlkLCBvcHRzLm1lc3NhZ2UsIG9wdHMpO1xuICAgICAgcmV0dXJuIG1ldGhvZC5iaW5kKGNvbnNvbGUsIG1lc3NhZ2UsIC4uLm9wdHMuYXJncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cblxufVxuTG9nLlZFUlNJT04gPSBWRVJTSU9OO1xuXG5mdW5jdGlvbiBub3JtYWxpemVMb2dMZXZlbChsb2dMZXZlbCkge1xuICBpZiAoIWxvZ0xldmVsKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBsZXQgcmVzb2x2ZWRMZXZlbDtcblxuICBzd2l0Y2ggKHR5cGVvZiBsb2dMZXZlbCkge1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXNvbHZlZExldmVsID0gbG9nTGV2ZWw7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICByZXNvbHZlZExldmVsID0gbG9nTGV2ZWwubG9nTGV2ZWwgfHwgbG9nTGV2ZWwucHJpb3JpdHkgfHwgMDtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAwO1xuICB9XG5cbiAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShyZXNvbHZlZExldmVsKSAmJiByZXNvbHZlZExldmVsID49IDApO1xuICByZXR1cm4gcmVzb2x2ZWRMZXZlbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUFyZ3VtZW50cyhvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBsb2dMZXZlbCxcbiAgICBtZXNzYWdlXG4gIH0gPSBvcHRzO1xuICBvcHRzLmxvZ0xldmVsID0gbm9ybWFsaXplTG9nTGV2ZWwobG9nTGV2ZWwpO1xuICBjb25zdCBhcmdzID0gb3B0cy5hcmdzID8gQXJyYXkuZnJvbShvcHRzLmFyZ3MpIDogW107XG5cbiAgd2hpbGUgKGFyZ3MubGVuZ3RoICYmIGFyZ3Muc2hpZnQoKSAhPT0gbWVzc2FnZSkge31cblxuICBvcHRzLmFyZ3MgPSBhcmdzO1xuXG4gIHN3aXRjaCAodHlwZW9mIGxvZ0xldmVsKSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFyZ3MudW5zaGlmdChtZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgb3B0cy5tZXNzYWdlID0gbG9nTGV2ZWw7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICBPYmplY3QuYXNzaWduKG9wdHMsIGxvZ0xldmVsKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb3B0cy5tZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0cy5tZXNzYWdlID0gb3B0cy5tZXNzYWdlKCk7XG4gIH1cblxuICBjb25zdCBtZXNzYWdlVHlwZSA9IHR5cGVvZiBvcHRzLm1lc3NhZ2U7XG4gIGFzc2VydChtZXNzYWdlVHlwZSA9PT0gJ3N0cmluZycgfHwgbWVzc2FnZVR5cGUgPT09ICdvYmplY3QnKTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24ob3B0cywgb3B0cy5vcHRzKTtcbn1cblxuZnVuY3Rpb24gZGVjb3JhdGVNZXNzYWdlKGlkLCBtZXNzYWdlLCBvcHRzKSB7XG4gIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCB0aW1lID0gb3B0cy50aW1lID8gbGVmdFBhZChmb3JtYXRUaW1lKG9wdHMudG90YWwpKSA6ICcnO1xuICAgIG1lc3NhZ2UgPSBvcHRzLnRpbWUgPyBcIlwiLmNvbmNhdChpZCwgXCI6IFwiKS5jb25jYXQodGltZSwgXCIgIFwiKS5jb25jYXQobWVzc2FnZSkgOiBcIlwiLmNvbmNhdChpZCwgXCI6IFwiKS5jb25jYXQobWVzc2FnZSk7XG4gICAgbWVzc2FnZSA9IGFkZENvbG9yKG1lc3NhZ2UsIG9wdHMuY29sb3IsIG9wdHMuYmFja2dyb3VuZCk7XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxuZnVuY3Rpb24gbG9nSW1hZ2VJbk5vZGUoe1xuICBpbWFnZSxcbiAgbWVzc2FnZSA9ICcnLFxuICBzY2FsZSA9IDFcbn0pIHtcbiAgbGV0IGFzY2lpZnkgPSBudWxsO1xuXG4gIHRyeSB7XG4gICAgYXNjaWlmeSA9IG1vZHVsZS5yZXF1aXJlKCdhc2NpaWZ5LWltYWdlJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7fVxuXG4gIGlmIChhc2NpaWZ5KSB7XG4gICAgcmV0dXJuICgpID0+IGFzY2lpZnkoaW1hZ2UsIHtcbiAgICAgIGZpdDogJ2JveCcsXG4gICAgICB3aWR0aDogXCJcIi5jb25jYXQoTWF0aC5yb3VuZCg4MCAqIHNjYWxlKSwgXCIlXCIpXG4gICAgfSkudGhlbihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKTtcbiAgfVxuXG4gIHJldHVybiBub29wO1xufVxuXG5mdW5jdGlvbiBsb2dJbWFnZUluQnJvd3Nlcih7XG4gIGltYWdlLFxuICBtZXNzYWdlID0gJycsXG4gIHNjYWxlID0gMVxufSkge1xuICBpZiAodHlwZW9mIGltYWdlID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBmb3JtYXRJbWFnZShpbWcsIG1lc3NhZ2UsIHNjYWxlKTtcbiAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH07XG5cbiAgICBpbWcuc3JjID0gaW1hZ2U7XG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gaW1hZ2Uubm9kZU5hbWUgfHwgJyc7XG5cbiAgaWYgKGVsZW1lbnQudG9Mb3dlckNhc2UoKSA9PT0gJ2ltZycpIHtcbiAgICBjb25zb2xlLmxvZyguLi5mb3JtYXRJbWFnZShpbWFnZSwgbWVzc2FnZSwgc2NhbGUpKTtcbiAgICByZXR1cm4gbm9vcDtcbiAgfVxuXG4gIGlmIChlbGVtZW50LnRvTG93ZXJDYXNlKCkgPT09ICdjYW52YXMnKSB7XG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICBpbWcub25sb2FkID0gKCkgPT4gY29uc29sZS5sb2coLi4uZm9ybWF0SW1hZ2UoaW1nLCBtZXNzYWdlLCBzY2FsZSkpO1xuXG4gICAgaW1nLnNyYyA9IGltYWdlLnRvRGF0YVVSTCgpO1xuICAgIHJldHVybiBub29wO1xuICB9XG5cbiAgcmV0dXJuIG5vb3A7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2cuanMubWFwIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdBc3NlcnRpb24gZmFpbGVkJyk7XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydC5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gYXV0b2JpbmQob2JqLCBwcmVkZWZpbmVkID0gWydjb25zdHJ1Y3RvciddKSB7XG4gIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG4gIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcblxuICBmb3IgKGNvbnN0IGtleSBvZiBwcm9wTmFtZXMpIHtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoIXByZWRlZmluZWQuZmluZChuYW1lID0+IGtleSA9PT0gbmFtZSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBvYmpba2V5XS5iaW5kKG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRvYmluZC5qcy5tYXAiLCJpbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuL2dsb2JhbHMnO1xuZXhwb3J0IGNvbnN0IENPTE9SID0ge1xuICBCTEFDSzogMzAsXG4gIFJFRDogMzEsXG4gIEdSRUVOOiAzMixcbiAgWUVMTE9XOiAzMyxcbiAgQkxVRTogMzQsXG4gIE1BR0VOVEE6IDM1LFxuICBDWUFOOiAzNixcbiAgV0hJVEU6IDM3LFxuICBCUklHSFRfQkxBQ0s6IDkwLFxuICBCUklHSFRfUkVEOiA5MSxcbiAgQlJJR0hUX0dSRUVOOiA5MixcbiAgQlJJR0hUX1lFTExPVzogOTMsXG4gIEJSSUdIVF9CTFVFOiA5NCxcbiAgQlJJR0hUX01BR0VOVEE6IDk1LFxuICBCUklHSFRfQ1lBTjogOTYsXG4gIEJSSUdIVF9XSElURTogOTdcbn07XG5cbmZ1bmN0aW9uIGdldENvbG9yKGNvbG9yKSB7XG4gIHJldHVybiB0eXBlb2YgY29sb3IgPT09ICdzdHJpbmcnID8gQ09MT1JbY29sb3IudG9VcHBlckNhc2UoKV0gfHwgQ09MT1IuV0hJVEUgOiBjb2xvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZENvbG9yKHN0cmluZywgY29sb3IsIGJhY2tncm91bmQpIHtcbiAgaWYgKCFpc0Jyb3dzZXIgJiYgdHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIGNvbG9yID0gZ2V0Q29sb3IoY29sb3IpO1xuICAgICAgc3RyaW5nID0gXCJcXHgxQltcIi5jb25jYXQoY29sb3IsIFwibVwiKS5jb25jYXQoc3RyaW5nLCBcIlxceDFCWzM5bVwiKTtcbiAgICB9XG5cbiAgICBpZiAoYmFja2dyb3VuZCkge1xuICAgICAgY29sb3IgPSBnZXRDb2xvcihiYWNrZ3JvdW5kKTtcbiAgICAgIHN0cmluZyA9IFwiXFx4MUJbXCIuY29uY2F0KGJhY2tncm91bmQgKyAxMCwgXCJtXCIpLmNvbmNhdChzdHJpbmcsIFwiXFx4MUJbNDltXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHJpbmc7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb2xvci5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gZm9ybWF0VGltZShtcykge1xuICBsZXQgZm9ybWF0dGVkO1xuXG4gIGlmIChtcyA8IDEwKSB7XG4gICAgZm9ybWF0dGVkID0gXCJcIi5jb25jYXQobXMudG9GaXhlZCgyKSwgXCJtc1wiKTtcbiAgfSBlbHNlIGlmIChtcyA8IDEwMCkge1xuICAgIGZvcm1hdHRlZCA9IFwiXCIuY29uY2F0KG1zLnRvRml4ZWQoMSksIFwibXNcIik7XG4gIH0gZWxzZSBpZiAobXMgPCAxMDAwKSB7XG4gICAgZm9ybWF0dGVkID0gXCJcIi5jb25jYXQobXMudG9GaXhlZCgwKSwgXCJtc1wiKTtcbiAgfSBlbHNlIHtcbiAgICBmb3JtYXR0ZWQgPSBcIlwiLmNvbmNhdCgobXMgLyAxMDAwKS50b0ZpeGVkKDIpLCBcInNcIik7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0dGVkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxlZnRQYWQoc3RyaW5nLCBsZW5ndGggPSA4KSB7XG4gIGNvbnN0IHBhZExlbmd0aCA9IE1hdGgubWF4KGxlbmd0aCAtIHN0cmluZy5sZW5ndGgsIDApO1xuICByZXR1cm4gXCJcIi5jb25jYXQoJyAnLnJlcGVhdChwYWRMZW5ndGgpKS5jb25jYXQoc3RyaW5nKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByaWdodFBhZChzdHJpbmcsIGxlbmd0aCA9IDgpIHtcbiAgY29uc3QgcGFkTGVuZ3RoID0gTWF0aC5tYXgobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCwgMCk7XG4gIHJldHVybiBcIlwiLmNvbmNhdChzdHJpbmcpLmNvbmNhdCgnICcucmVwZWF0KHBhZExlbmd0aCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFZhbHVlKHYsIG9wdHMgPSB7fSkge1xuICBjb25zdCBFUFNJTE9OID0gMWUtMTY7XG4gIGNvbnN0IHtcbiAgICBpc0ludGVnZXIgPSBmYWxzZVxuICB9ID0gb3B0cztcblxuICBpZiAoQXJyYXkuaXNBcnJheSh2KSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcodikpIHtcbiAgICByZXR1cm4gZm9ybWF0QXJyYXlWYWx1ZSh2LCBvcHRzKTtcbiAgfVxuXG4gIGlmICghTnVtYmVyLmlzRmluaXRlKHYpKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2KTtcbiAgfVxuXG4gIGlmIChNYXRoLmFicyh2KSA8IEVQU0lMT04pIHtcbiAgICByZXR1cm4gaXNJbnRlZ2VyID8gJzAnIDogJzAuJztcbiAgfVxuXG4gIGlmIChpc0ludGVnZXIpIHtcbiAgICByZXR1cm4gdi50b0ZpeGVkKDApO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHYpID4gMTAwICYmIE1hdGguYWJzKHYpIDwgMTAwMDApIHtcbiAgICByZXR1cm4gdi50b0ZpeGVkKDApO1xuICB9XG5cbiAgY29uc3Qgc3RyaW5nID0gdi50b1ByZWNpc2lvbigyKTtcbiAgY29uc3QgZGVjaW1hbCA9IHN0cmluZy5pbmRleE9mKCcuMCcpO1xuICByZXR1cm4gZGVjaW1hbCA9PT0gc3RyaW5nLmxlbmd0aCAtIDIgPyBzdHJpbmcuc2xpY2UoMCwgLTEpIDogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheVZhbHVlKHYsIG9wdHMpIHtcbiAgY29uc3Qge1xuICAgIG1heEVsdHMgPSAxNixcbiAgICBzaXplID0gMVxuICB9ID0gb3B0cztcbiAgbGV0IHN0cmluZyA9ICdbJztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHYubGVuZ3RoICYmIGkgPCBtYXhFbHRzOyArK2kpIHtcbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHN0cmluZyArPSBcIixcIi5jb25jYXQoaSAlIHNpemUgPT09IDAgPyAnICcgOiAnJyk7XG4gICAgfVxuXG4gICAgc3RyaW5nICs9IGZvcm1hdFZhbHVlKHZbaV0sIG9wdHMpO1xuICB9XG5cbiAgY29uc3QgdGVybWluYXRvciA9IHYubGVuZ3RoID4gbWF4RWx0cyA/ICcuLi4nIDogJ10nO1xuICByZXR1cm4gXCJcIi5jb25jYXQoc3RyaW5nKS5jb25jYXQodGVybWluYXRvcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJbWFnZShpbWFnZSwgbWVzc2FnZSwgc2NhbGUsIG1heFdpZHRoID0gNjAwKSB7XG4gIGNvbnN0IGltYWdlVXJsID0gaW1hZ2Uuc3JjLnJlcGxhY2UoL1xcKC9nLCAnJTI4JykucmVwbGFjZSgvXFwpL2csICclMjknKTtcblxuICBpZiAoaW1hZ2Uud2lkdGggPiBtYXhXaWR0aCkge1xuICAgIHNjYWxlID0gTWF0aC5taW4oc2NhbGUsIG1heFdpZHRoIC8gaW1hZ2Uud2lkdGgpO1xuICB9XG5cbiAgY29uc3Qgd2lkdGggPSBpbWFnZS53aWR0aCAqIHNjYWxlO1xuICBjb25zdCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQgKiBzY2FsZTtcbiAgY29uc3Qgc3R5bGUgPSBbJ2ZvbnQtc2l6ZToxcHg7JywgXCJwYWRkaW5nOlwiLmNvbmNhdChNYXRoLmZsb29yKGhlaWdodCAvIDIpLCBcInB4IFwiKS5jb25jYXQoTWF0aC5mbG9vcih3aWR0aCAvIDIpLCBcInB4O1wiKSwgXCJsaW5lLWhlaWdodDpcIi5jb25jYXQoaGVpZ2h0LCBcInB4O1wiKSwgXCJiYWNrZ3JvdW5kOnVybChcIi5jb25jYXQoaW1hZ2VVcmwsIFwiKTtcIiksIFwiYmFja2dyb3VuZC1zaXplOlwiLmNvbmNhdCh3aWR0aCwgXCJweCBcIikuY29uY2F0KGhlaWdodCwgXCJweDtcIiksICdjb2xvcjp0cmFuc3BhcmVudDsnXS5qb2luKCcnKTtcbiAgcmV0dXJuIFtcIlwiLmNvbmNhdChtZXNzYWdlLCBcIiAlYytcIiksIHN0eWxlXTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcm1hdHRlcnMuanMubWFwIiwiaW1wb3J0IGNoZWNrSWZCcm93c2VyIGZyb20gJy4uL2Vudi9pcy1icm93c2VyJztcbmV4cG9ydCB7IHNlbGYsIHdpbmRvdywgZ2xvYmFsLCBkb2N1bWVudCwgcHJvY2VzcywgY29uc29sZSB9IGZyb20gJy4uL2Vudi9nbG9iYWxzJztcbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gdHlwZW9mIF9fVkVSU0lPTl9fICE9PSAndW5kZWZpbmVkJyA/IF9fVkVSU0lPTl9fIDogJ3VudHJhbnNwaWxlZCBzb3VyY2UnO1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9IGNoZWNrSWZCcm93c2VyKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsImltcG9ydCB7IHdpbmRvdywgcHJvY2VzcywgaXNCcm93c2VyIH0gZnJvbSAnLi9nbG9iYWxzJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEhpUmVzVGltZXN0YW1wKCkge1xuICBsZXQgdGltZXN0YW1wO1xuXG4gIGlmIChpc0Jyb3dzZXIgJiYgd2luZG93LnBlcmZvcm1hbmNlKSB7XG4gICAgdGltZXN0YW1wID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICB9IGVsc2UgaWYgKHByb2Nlc3MuaHJ0aW1lKSB7XG4gICAgY29uc3QgdGltZVBhcnRzID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgICB0aW1lc3RhbXAgPSB0aW1lUGFydHNbMF0gKiAxMDAwICsgdGltZVBhcnRzWzFdIC8gMWU2O1xuICB9IGVsc2Uge1xuICAgIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gIH1cblxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGktcmVzLXRpbWVzdGFtcC5qcy5tYXAiLCJmdW5jdGlvbiBnZXRTdG9yYWdlKHR5cGUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdG9yYWdlID0gd2luZG93W3R5cGVdO1xuICAgIGNvbnN0IHggPSAnX19zdG9yYWdlX3Rlc3RfXyc7XG4gICAgc3RvcmFnZS5zZXRJdGVtKHgsIHgpO1xuICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSh4KTtcbiAgICByZXR1cm4gc3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZSB7XG4gIGNvbnN0cnVjdG9yKGlkLCBkZWZhdWx0U2V0dGluZ3MsIHR5cGUgPSAnc2Vzc2lvblN0b3JhZ2UnKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gZ2V0U3RvcmFnZSh0eXBlKTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuY29uZmlnLCBkZWZhdWx0U2V0dGluZ3MpO1xuXG4gICAgdGhpcy5fbG9hZENvbmZpZ3VyYXRpb24oKTtcbiAgfVxuXG4gIGdldENvbmZpZ3VyYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG5cbiAgc2V0Q29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb24pO1xuICB9XG5cbiAgdXBkYXRlQ29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmNvbmZpZywgY29uZmlndXJhdGlvbik7XG5cbiAgICBpZiAodGhpcy5zdG9yYWdlKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcpO1xuICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0odGhpcy5pZCwgc2VyaWFsaXplZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfbG9hZENvbmZpZ3VyYXRpb24oKSB7XG4gICAgbGV0IGNvbmZpZ3VyYXRpb24gPSB7fTtcblxuICAgIGlmICh0aGlzLnN0b3JhZ2UpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZWRDb25maWd1cmF0aW9uID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0odGhpcy5pZCk7XG4gICAgICBjb25maWd1cmF0aW9uID0gc2VyaWFsaXplZENvbmZpZ3VyYXRpb24gPyBKU09OLnBhcnNlKHNlcmlhbGl6ZWRDb25maWd1cmF0aW9uKSA6IHt9O1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5jb25maWcsIGNvbmZpZ3VyYXRpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvY2FsLXN0b3JhZ2UuanMubWFwIiwiLyogKGlnbm9yZWQpICovIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEFuaW1hdGlvbkxvb3AsIE1vZGVsIH0gZnJvbSAnQGx1bWEuZ2wvZW5naW5lJztcbmltcG9ydCB7IEJ1ZmZlciwgY2xlYXIgfSBmcm9tICdAbHVtYS5nbC93ZWJnbCc7XG5jb25zdCBsb29wID0gbmV3IEFuaW1hdGlvbkxvb3Aoe1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBvbkluaXRpYWxpemU6IGZ1bmN0aW9uICh7IGdsIH0pIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gWzAuMCwgMC42LCAwLjYsIC0wLjYsIC0wLjYsIC0wLjZdO1xuICAgICAgICBjb25zdCBwb3NpdGlvbkJ1ZmZlciA9IG5ldyBCdWZmZXIoZ2wsIG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKSk7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKGdsLCB7XG4gICAgICAgICAgICB2czogYFxuICAgICAgICAgICAgdW5pZm9ybSBmbG9hdCB0aW1lO1xuICAgICAgICAgICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgZlBvc2l0aW9uO1xuXG4gICAgICAgICAgICBtYXQyIHJvdChmbG9hdCByKSB7XG4gICAgICAgICAgICAgICAgZmxvYXQgY3IgPSBjb3Mocik7XG4gICAgICAgICAgICAgICAgZmxvYXQgc3IgPSBzaW4ocik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdDIoXG4gICAgICAgICAgICAgICAgICAgIGNyLCBzcixcbiAgICAgICAgICAgICAgICAgICAgLXNyLCBjclxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgZlBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHJvdCh0aW1lICogMC4wMDEpICogcG9zaXRpb24sIDAuMCwgMS4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGAsXG4gICAgICAgICAgICBmczogYFxuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIGZQb3NpdGlvbjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGZQb3NpdGlvbiwgbGVuZ3RoKGZQb3NpdGlvbiksIDEuMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBgLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbkJ1ZmZlcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2ZXJ0ZXhDb3VudDogcG9zaXRpb25zLmxlbmd0aCAvIDIsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBtb2RlbCB9O1xuICAgIH0sXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG9uUmVuZGVyKHsgZ2wsIG1vZGVsIH0pIHtcbiAgICAgICAgY2xlYXIoZ2wsIHsgY29sb3I6IFswLCAwLCAwLCAxXSB9KTtcbiAgICAgICAgY29uc3QgdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBtb2RlbC5zZXRVbmlmb3Jtcyh7IHRpbWUgfSk7XG4gICAgICAgIG1vZGVsLmRyYXcoKTtcbiAgICB9LFxufSk7XG5sb29wLnN0YXJ0KCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=