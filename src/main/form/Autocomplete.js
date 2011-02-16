
Ext.ns('Ext.ux.jnap.form');


/**
 * @class Ext.ux.jnap.Autocomplete
 * @extends Ext.form.ComboBox
 */
Ext.ux.jnap.form.Autocomplete = Ext.extend(Ext.form.ComboBox, {

	animateOnItemAdd : false,

	animateOnItemRemove : false,

	autoSelect : false,

	baseCls : 'ux-autocomplete',

	bindItemAddKey : true,

	blockAlreadyAddedItem : true,

	defaultItemWidth : 200,

	emptyText : 'emptyText',

	hideTrigger : true,

	itemContainerMinWidth : undefined,

	itemShadow : false,

	/**
	 * @cfg {String} itemLayout
	 */
	itemLayout : 'inline',

	itemMinWidth : 150,

	itemWidth : undefined,

	itemTpl : '{displayField}',

	listEmptyText : 'listEmptyText',

	itemCloseTip : 'Click to remove item',

	minChars : 1,

	multiple : false,

	queryParam : 'searchQuery',

	removedItemsName : undefined,

	submitOnlyNewItems : false,

	// private
	_currentSelectedRecord : null,

	// private
	_addedItems : new Ext.util.MixedCollection(),

	initComponent : function() {
		Ext.ux.jnap.form.Autocomplete.superclass.initComponent.call(this);
		if (!!this.multiple) {
			this._applyMultipleConfig();
			this.afterRender = this.afterRender.createSequence(this._bindEvents, this);
			this.addEvents(
				/**
				 * @event
				 */
				'beforeitemadd',
				/**
				 * @event
				 */
				'itemadded',
				'beforeitemremove',
				'itemremoved'
			);
			// item tpl
			if (Ext.isString(this.itemTpl)) {
				this.itemTpl = new Ext.XTemplate(this.itemTpl, { compiled : true });
			}
		}
	},

	onTriggerClick : function() {
		if (this._currentSelectedRecord) {
			this.addItem(this._currentSelectedRecord);
			this.clear();
		}
	},

	addItem : function(record) {
		if (!this.wasAlreadyAdded(record) && this.fireEvent('beforeitemadd', this, record) !== false) {
			var addedItemEl = this.onItemAdd(record);
			this.fireEvent('itemadded', this, record, addedItemEl);
		}
	},

	onItemAdd : function(record) {
		var item = new Ext.ux.jnap.AutocompleteItem(this, record);		
		this._addedItems.add(item);
		return item;
	},

	clear : function() {
		this.setValue('');
		this._currentSelectedRecord = null;
	},

	wasAlreadyAdded : function(record) {
		var alreadyAdded = false;
		if (this.blockAlreadyAddedItem) {
			alreadyAdded = this._addedItems.find(function(item) {
				return item.record.id == record.id;
			}, this) != null;
		}
		return alreadyAdded;
	},

	onDestroy : function() {
		if (this.rendered) {
//			Ext.destroyMembers(this, '_textEl', '_titleEl');
		}
		Ext.ux.jnap.form.Autocomplete.superclass.onDestroy.call(this);
	},

	_applyMultipleConfig : function() {
		this.hideTrigger = false;
		this.triggerClass = this.baseCls + '-add-trigger';
	},

	getItemContainer : function() {
		if (!this._selectedItemsEl) {
			var fieldWrap = Ext.ux.jnap.util.ExtUtils.wrapField(this);
			this._selectedItemsEl = fieldWrap.createChild({
				tag : 'div',
				cls : this.baseCls + '-multiple-items'
			});
			this._selectedItemsEl.addClass(this.itemLayout);
			if (this.itemShadow) {
				this._selectedItemsEl.addClass('shadow');
			}
			if (this.itemContainerMinWidth) {
				fieldWrap.setWidth(this.itemContainerMinWidth);
			}
			this._bindEvents();
		}
		return this._selectedItemsEl;
	},

	_resetCurrentRecord : function() {
		this._currentSelectedRecord = null;
	},

	_bindEvents : function() {
		this.mon(this, 'select', function(field, record, index) {
			this._currentSelectedRecord = record;
		}, this);
		// key events
		this.enableKeyEvents = true;
		this.mon(this, 'specialkey', function(field, e) {
			if (this.bindItemAddKey && (e.getKey() == e.ENTER)) {
				this.onTriggerClick();
			}
		}, this);
	}

});

/**
 * @class Ext.ux.jnap.AutocompleteItem
 * @extends Object
 */
Ext.ux.jnap.AutocompleteItem = Ext.extend(Object, {

	autocomplete : null,

	id : null,

	itemEl : null,

	record : null,

	removeItemEl : null,

	constructor : function(autocomplete, record) {
		this.autocomplete = autocomplete;
		this.record = record;
		this.itemEl = this._createItemEl(autocomplete.getItemContainer());
		this.itemEl.setVisible(true, this.getParentCfg('animateOnItemAdd'));
	},

	/**
	 * Gets a config value from the parent (autocomplete component).
	 * @param {String} configName The config name.
	 * @return {Object} The value of the config param associated with the provided name or null.
	 */
	getParentCfg : function(configName) {
		return this.autocomplete[configName];
	},

	/**
	 * Remove this item from the added items. It fires the 'beforeitemremove' before removal
	 * so if you want to stop item removal you should return false on that listener.
	 * After a successful removal the 'itemremoved' event is fired.
	 */
	remove : function() {
		this.autocomplete._addedItems.remove(this);
		if (this.autocomplete.fireEvent('beforeitemremove', this.autocomplete, this) !== false) {
			var _doRemove = function() {
				this.autocomplete.fireEvent('itemremoved', this.autocomplete, this);
				this.removeItemTooltip.hide();
				Ext.destroyMembers(this, 'itemEl', 'removeItemEl', 'removeItemTooltip');
			};
			if (this.getParentCfg('animateOnItemRemove')) {
				this.itemEl.setVisible(false, {
					callback : _doRemove.createDelegate(this)
				});
			} else {
				this.itemEl.setVisible(false);
				_doRemove.call(this);
			}
		}
	},

	getEl : function() {
		return this.itemEl;
	},

	// private
	_createItemEl : function(ct) {
		var tplArgs = this._getTplArgs();
		var baseCls = this.getParentCfg('baseCls');
		var item = ct.createChild({
			tag : 'div',
			cls : baseCls + '-multiple-item',
			style : {
				display : 'none'
			},
			children : [{
				tag : 'input',
				type: 'hidden',
				name : this.getParentCfg('name'),
				value : tplArgs.valueField
			}, {
				tag : 'span',
				cls : baseCls + '-multiple-item-content',
				html : this.getParentCfg('itemTpl').apply(tplArgs)
			}]
		});
		this.removeItemEl = this._createItemRemoveEl(item);
		var width = ('stack' === this.getParentCfg('itemLayout') && !this.getParentCfg('itemWidth'))
			? this.getParentCfg('defaultItemWidth') : null;
		if (width) {
			item.setWidth(width);
		}
		var minWidth = this.getParentCfg('itemMinWidth') || 0;
		if (item.getWidth() < minWidth) {
			item.setWidth(minWidth);
		}
		this.id = Ext.id(item);
		return item;
	},

	// private
	_createItemRemoveEl : function(item) {
		var el = item.createChild({
			tag : 'span',
			cls : this.getParentCfg('baseCls') + '-multiple-item-remove'
		});
		this.removeItemTooltip = new Ext.ToolTip({
			target : el,
			html : this.getParentCfg('itemCloseTip')
		});
		this.autocomplete.mon(el, 'click', this.remove, this);
		return el;
	},

	_getTplArgs : function() {
		var r = this.record;
		var tplArgs = Ext.apply({}, r.data);
		Ext.apply(tplArgs, {
			id : r.id,
			displayField : r.get(this.getParentCfg('displayField')),
			valueField : r.get(this.getParentCfg('valueField'))
		});
		return tplArgs;
	}

});