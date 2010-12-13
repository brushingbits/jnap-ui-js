
/**
 * @class Ext.ux.jnap.TagCloud
 * @extends Ext.DataView
 */
Ext.ux.jnap.TagCloud = Ext.extend(Ext.DataView, {

	/**
	 * @cfg {Boolean} animated
	 */
	animated : true,

	/**
	 * @cfg {String} baseCls
	 */
	baseCls : 'x-tagcloud',

	/**
	 * @cfg {String} fontSizeUnit
	 */
	fontSizeUnit : 'px',
	
	/**
	 * @cfg {String} headStyle
	 */
	headStyle : 'cloud',

	/**
	 * @cfg {Number} minFontSize
	 */
	minFontSize : 11,

	/**
	 * @cfg {Number} maxFontSize
	 */
	maxFontSize : 28,
	
	/**
	 * @cfg {String} occurencesProperty
	 */
	occurencesProperty : 'occurences',

	/**
	 * @cfg {String} tagLink
	 */
	tagLink : 'tag/{text}',

	/**
	 * @cfg {String} tagText
	 */
	tagText : '{text}',

	/**
	 * @cfg {String} title
	 */
	title : undefined,

	// private
	initComponent : function() {
		Ext.ux.jnap.TagCloud.superclass.initComponent.call(this);
		Ext.apply(this, {
			cls : this.baseCls,
			itemSelector : 'li.' + this.baseCls + '-tag',
			singleSelect : false,
			multiSelect : false,
			selectedClass : '',
			overClass : this.baseCls + '-tag-over'
		});
		this.tpl = new Ext.XTemplate(
			'<tpl if="headStyle != \'plain\'"><div class="{baseCls}-header-{headStyle}"></div></tpl>',
			'<div class="{baseCls}-body">',
				'<tpl if="title"><h3>{title}</h3></tpl>',
				'<ul class="{baseCls}-tag-list">',
				'<tpl for="tags">',
					'<li class="{parent.baseCls}-tag">',
						'<a href="' + this.tagLink + '">' + this.tagText + '</a>',
					'</li>',
				'</tpl>',
				'</ul>',
			'</div>', {
				compiled: true,
				disableFormats: true
			}
		);
	},

	// overridden
	collectData : function(records, startIndex) {
		var data = this;
		Ext.apply(data, {
			tags : Ext.ux.jnap.TagCloud.superclass.collectData.call(this, records, startIndex)
		});
		return data;
	},

	// overridden
	refresh : function() {
		Ext.ux.jnap.TagCloud.superclass.refresh.call(this);
		this.onRefresh.defer(10, this);
	},

	/**
	 * Calculates and updates the font size of each tag after 'refresh'.
	 */
	onRefresh : function() {
		var freqArray = this.store.collect(this.occurencesProperty);
		var minOccurs = Ext.min(freqArray),
			maxOccurs = Ext.max(freqArray);
		Ext.each(this.all.elements, function(item, i, array) {
			// calculating font size using logarithmic mapping
			var record = this.store.getAt(item.viewIndex);
			var tagOccurs = record.get(this.occurencesProperty);
			var weight = (Math.log(tagOccurs) - Math.log(minOccurs)) / (Math.log(maxOccurs) - Math.log(minOccurs));
			var fontSize = this.minFontSize + Math.round((this.maxFontSize - this.minFontSize) * weight);
			// setting font size
			this._setTagFontSize(Ext.fly(item).first(), fontSize);
		}, this);
	},

	/**
	 * 
	 * @param tagEl
	 * @param fontSize
	 */
	_setTagFontSize : function(tagEl, fontSize) {
		if (this.animated) {
			tagEl.animate({
				fontSize : {
					from : this.minFontSize,
					to : fontSize,
					unit : this.fontSizeUnit
				}
			}, 0.3, null, 'easeOut', 'run');
		} else {
			tagEl.setStyle('fontSize', fontSize + this.fontSizeUnit);
		}
	}

});