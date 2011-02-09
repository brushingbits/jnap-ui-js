
Ext.ns('Ext.ux.jnap');

/**
 * @class Ext.ux.jnap.Autocomplete
 * @extends Ext.form.ComboBox
 */
Ext.ux.jnap.Autocomplete = Ext.extend(Ext.form.ComboBox, {

	autoSelect : false,

	baseCls : 'ux-autocomplete',

	bindItemAddKey : true,

	blockAlreadyAddedItem : true,

	defaultItemWidth : 200,

	emptyText : 'emptyText',

	hideTrigger : true,

	itemMode : 'stacked',

	itemWidth : undefined,

	itemTpl : '<div>{displayField}</div>',

	listEmptyText : 'listEmptyText',

	minChars : 2,

	multiple : false,

	queryParam : 'searchQuery',


	// private
	_currentSelectedRecord : null,

	// private
	_addedItems : new Ext.util.MixedCollection(),

	initComponent : function() {
		Ext.ux.jnap.Autocomplete.superclass.initComponent.call(this);
		if (!!this.multiple) {
			this._applyMultipleConfig();
			this.afterRender = this.afterRender.createSequence(this._createMultipleContainer, this);
			this.addEvents(
				/**
				 * @event
				 */
				'beforeitemadd',
				/**
				 * @event
				 */
				'itemadded'
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
		this._addedItems.add(record.id, record);
		var item = this._selectedItemsEl.createChild(this._createItem(record));
		var width = ('stacked' === this.itemMode && !this.itemWidth) ? this.defaultItemWidth : null;
		if (width) {
			item.setWidth(width);
		}
		return item;
	},

	clear : function() {
		this.setValue('');
		this._currentSelectedRecord = null;
	},

	wasAlreadyAdded : function(record) {
		var alreadyAdded = false;
		if (this.blockAlreadyAddedItem) {
			alreadyAdded = this._addedItems.get(record.id) != null;
		}
		return alreadyAdded;
	},

	_applyMultipleConfig : function() {
		this.hideTrigger = false;
		this.triggerClass = this.baseCls + '-add-trigger';
	},

	_createMultipleContainer : function() {
		var fieldWrap = Ext.ux.jnap.util.ExtUtils.wrapField(this);
		this._selectedItemsEl = fieldWrap.createChild({
			tag : 'div',
			cls : this.baseCls + '-multiple-items'
		});
		this._selectedItemsEl.addClass(this.itemMode);
		this._bindEvents();		
	},

	_createItem : function(record) {
		var tplArgs = Ext.apply({}, record.data);
		Ext.apply(tplArgs, {
			id : record.id,
			displayField : record.get(this.displayField),
			valueField : record.get(this.valueField)
		});
		return {
			tag : 'div',
			cls : this.baseCls + '-multiple-item',
			html : this.itemTpl.apply(tplArgs)
		};
	},

	_bindEvents : function() {
		this.mon(this, 'select', function(field, record, index) {
			this._currentSelectedRecord = record;
		}, this);
		// add key event on ENTER
		if (this.bindItemAddKey) {
			this.enableKeyEvents = true;
			this.mon(this.el, 'keypress', function(e, field) {
				if (e.getKey() == Ext.EventObject.ENTER) {
					this.onTriggerClick();
				}
			}, this);
		}
	}

});