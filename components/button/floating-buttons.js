import 'lit-media-query/lit-media-query.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { RtlMixin } from '../../mixins/rtl-mixin.js';
import { styleMap } from 'lit-html/directives/style-map.js';

class FloatingButtons extends RtlMixin(LitElement) {
	static get properties() {
		return {
			/**
			 * Whether always enable floating buttons. Note: by default, buttons may not float depending on
			 * space available since floating buttons may result in poor user experience when view-port is small
			 * (ex. phones).
			 */
			alwaysFloat: {
				type: Boolean
			},

			/**
			 * Minimum height of view-port in order for buttons to float.
			 */
			minHeight: {
				type: String
			},

			_viewportIsAtLeastMinHeight: {
				reflect: true,
				type: Boolean
			},

			_containerClasses :{
				type: Object
			},

			_innerContainerStyle: {
				type: Object
			},

			_buttonSpacerStyle: {
				type: Object
			}
		};
	}

	static get styles() {
		return [buttonStyles,
			css`
			:host {
				box-sizing: border-box;
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-floating-buttons-container {
				border-top: 1px solid transparent;
				display: block;
				margin: 0 auto;
				width: 100%;
			}
			.d2l-floating-buttons-container.d2l-floating-buttons-floating {
				animation: d2l-floating-buttons-animation 500ms ease-out;
				-webkit-animation: d2l-floating-buttons-animation 500ms ease-out;
				background-color: #ffffff;
				background-color: rgba(255, 255, 255, 0.88);
				border-top-color: var(--d2l-color-mica);
				bottom: 0;
				box-shadow: 0 -2px 4px rgba(86, 90, 92, .2);
				left: 0;
				position: fixed;
				right: 0;
				z-index: 999;
			}
			.d2l-floating-buttons-container > div {
				padding: 0.75rem 0 0 0;
				position: relative;
			}
			.d2l-floating-buttons-container > div {
				padding: 0.75rem 0 0 0;
				position: relative;
			}
			.d2l-floating-buttons-inner-container ::slotted(d2l-button),
			.d2l-floating-buttons-inner-container ::slotted(button),
			.d2l-floating-buttons-inner-container ::slotted(.d2l-button) {
				margin-right: 0.75rem !important;
				margin-bottom: 0.75rem !important;
			}
			:host-context([dir="rtl"]) .d2l-floating-buttons-inner-container ::slotted(d2l-button),
			:host-context([dir="rtl"]) .d2l-floating-buttons-inner-container ::slotted(button),
			:host-context([dir="rtl"]) .d2l-floating-buttons-inner-container ::slotted(.d2l-button) {
				margin-left: 0.75rem !important;
				margin-right: 0 !important;
			}

			@keyframes d2l-floating-buttons-animation {
				0% {
					border-color: transparent;
					background-color: transparent;
					transform: translate(0,10px);
				}
				100% {
					border-top-color: var(--d2l-color-mica);
					background-color: rgba(255, 255, 255, 0.88);
					transform: translate(0,0);
				}
			}
			@-webkit-keyframes d2l-floating-buttons-animation {
				0% {
					border-color: transparent;
					background-color: transparent;
					-webkit-transform: translate(0,10px);
				}
				100% {
					border-top-color: var(--d2l-color-mica);
					background-color: rgba(255, 255, 255, 0.88);
					-webkit-transform: translate(0,0);
				}
			}
			`
		];
	}

	constructor() {
		super();
		this._container = null;
		this._isRTL = false;
		this._spacer = null;
		this.minHeight = '500px';
		this._containerClasses = {
			'd2l-floating-buttons-container': true,
			'd2l-floating-buttons-floating': false
		};
		this._innerContainerStyle = {
			left: '',
			right: '',
			width: ''
		};
		this._buttonSpacerStyle = {
			height: '',
			display: ''
		};
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('resize', () => {
			this._reposition();
		});
		window.addEventListener('scroll', () => {
			this._reposition();
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('resize', () => {
			this._reposition();
		});
		window.removeEventListener('scroll', () => {
			this._reposition();
		});
	}

	render() {
		return html`
			<div class=${classMap(this._containerClasses)} >
				<div class="d2l-floating-buttons-inner-container"
					style=${styleMap(this._innerContainerStyle)}>
					<slot></slot>
				</div>
			</div>
			<div class="d2l-floating-buttons-spacer"
				style=${styleMap(this._buttonSpacerStyle)}>
			</div>
		`;
	}

	firstUpdated() {
		this._reposition = this._reposition.bind(this);
		this._container = this.shadowRoot.querySelector('.d2l-floating-buttons-container');
		this._spacer = this.shadowRoot.querySelector('.d2l-floating-buttons-spacer');
		this._isRTL = (getComputedStyle(this._container).direction === 'rtl');
		this.updateComplete.then(() => {
			this._reposition();
			let prevDocumentHeight = document.body.offsetHeight;
			setInterval(() => {
				const documentHeight = document.body.offsetHeight;
				if (prevDocumentHeight !== documentHeight) {
					this._reposition();
				}
				prevDocumentHeight = documentHeight;
			}, 100);
		});
	}

	/**
	 * Whether or not the buttons are floating.
	 */
	isFloating() {
		return this._containerClasses['d2l-floating-buttons-floating'];
	}

	_reposition() {
		if (this.minHeight) {
			this._viewportIsAtLeastMinHeight = window.matchMedia(`(max-height: ${this.minHeight})`).matches;
		}
		const containerRect = this._container.getBoundingClientRect();
		this._buttonSpacerStyle.height = `${containerRect.height}px`;
		const spacerRect = this._spacer.getBoundingClientRect();
		let containerTop;
		const bodyScrollTop = document.body.scrollTop;
		const isFloating = this._containerClasses['d2l-floating-buttons-floating'];

		if (isFloating) {
			containerTop = spacerRect.top + bodyScrollTop;
		} else {
			containerTop = containerRect.top + bodyScrollTop;
		}

		const viewBottom = bodyScrollTop + window.innerHeight;

		if (!this.alwaysFloat &&
			(this._viewportIsAtLeastMinHeight || ((containerTop + containerRect.height) <= viewBottom))) {

			if (!isFloating) {
				return;
			}

			this._containerClasses['d2l-floating-buttons-floating'] = false;
			if (!this._isRTL) {
				this._innerContainerStyle.left = `${0}px`;
			} else {
				this._innerContainerStyle.right = `${0}px`;
			}

			this._buttonSpacerStyle.display = 'none';
			this._innerContainerStyle.width = 'auto';

		} else {

			this._containerClasses['d2l-floating-buttons-floating'] = true;
			this._buttonSpacerStyle.display = 'block';

			const updateWithRect = isFloating ? spacerRect : containerRect;
			if (!this._isRTL) {
				if (Math.abs(this._innerContainerStyle.left.replace('px', '') - updateWithRect.left) > 1) {
					this._innerContainerStyle.left = `${updateWithRect.left}px`;
				}
			} else {
				if (Math.abs(this._innerContainerStyle.right.replace('px', '') - updateWithRect.left) > 1) {
					this._innerContainerStyle.right = `${updateWithRect.left}px`;
				}
			}
			if (Math.abs(this._innerContainerStyle.width.replace('px', '') - updateWithRect.width) > 1) {
				this._innerContainerStyle.width = `${updateWithRect.width}px`;
			}
		}
	}
}
customElements.define('d2l-floating-buttons', FloatingButtons);
