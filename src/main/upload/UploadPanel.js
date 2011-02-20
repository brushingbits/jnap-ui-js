/*!
 * 
 */
Ext.ns('Ext.ux.jnap.upload');

/**
 * @class Ext.ux.jnap.upload.UploadPanel
 * @extends Ext.Panel
 * @see Ext.ux.jnap.upload.Uploader
 * @xtype uploadpanel
 * 
 * @author Daniel Rochetti
 * @since 1.0
 */
Ext.ux.jnap.upload.UploadPanel = Ext.extend(Ext.Panel, {

	autoStart : true,

	browseButtonText : ['Add files...', 'Choose file'],

	filesStatusText : ['No files yet', 'Uploaded {0} of {1} files'],

	uploaderStatusText : ['Pending', 'Uploading', 'Done'],

	fileListHeader : {
		fileName : 'Name',
		fileSize : 'Size',
		fileProgress : 'Progress',
		fileStatus : 'Status'
	},

	maxFiles : 0,

	multiple : true,

	uploadCls : 'ux-upload',

	url : null,

	/**
	 * @cfg {Ext.ux.jnap.upload.Uploader} uploader
	 */
	uploader : null,

	initComponent : function() {
		this._layoutComponents();
		Ext.ux.jnap.upload.UploadPanel.superclass.initComponent.call(this);
		this.afterRender = this.afterRender.createSequence(this._initUploader, this);
	},

	/**
	 * 
	 * @return {Ext.ux.jnap.upload.Uploader}
	 */
	getUploader : function() {
		return this.uploader;
	},

	_layoutComponents : function() {
		this.layout = 'fit';
		// top toolbar
		this.browseFilesButton = new Ext.Button({
			text : this.multiple ? this.browseButtonText[0] : this.browseButtonText[1],
			iconCls : this.uploadCls + '-add-files-icon'
		});
		this.tbar = [ this.browseFilesButton ];

		// files listview
		this.UploadFile = Ext.data.Record.create(['id', 'name', 'size', 'percentage', 'status']);
		this.fileStore = new Ext.data.ArrayStore({
			idIndex: 0,
			data : [],
			fields : this.UploadFile,
			storeId : this.id + '-file-store'
		});
		this.filesGrid = new Ext.grid.GridPanel({
			autoExpandColumn : 'name',
			border : false,
			store : this.fileStore,
			colModel : new Ext.grid.ColumnModel({
				defaults : {
					sortable : false,
					resizable : true,
					menuDisabled : true
	        	},
    	    columns : [{
				header : this.fileListHeader.fileName,
				dataIndex : 'name',
				id : 'name'
			}, {
				align : 'right',
				header : this.fileListHeader.fileSize,
				dataIndex : 'size',
				width : 80,
				renderer : function(value) {
					return Ext.util.Format.fileSize(value);
				}
			}, {
				header : this.fileListHeader.fileProgress,
				dataIndex : 'progress',
				width : 140,
				renderer : this._fileProgressColumnRenderer.createDelegate(this)
			}, {
				header : this.fileListHeader.fileStatus,
				dataIndex : 'status',
				align : 'center',
				width : 60
			}]})
		});
		this.items = [ this.filesGrid ];

		// bottom toolbar
		this.filesStatusText = new Ext.Toolbar.TextItem('No files yet');
		this.bbar = [ this.filesStatusText ];
	},

	_initUploader : function() {
		this.uploader = new Ext.ux.jnap.upload.Uploader({
			autoStart : this.autoStart,
			baseCls : this.uploadCls,
			browseFilesTriggerEl : this.browseFilesButton.el,
			dropContainerEl : this.filesGrid.getEl(),
			multiple : this.multiple,
			url : this.url
		});
		this.mon(this.uploader, 'beforefileadd', this._onFileAdd, this);
		this.mon(this.uploader, 'queuechanged', this._onQueueChange, this);
		this.mon(this.uploader, 'uploadstart', this._onUploadStart, this);
		this.mon(this.uploader, 'uploadprogress', this._onUploadProgress, this);
		this.mon(this.uploader, 'uploadfinish', this._onUploadFinish, this);
		this._bindBrowseButtonEvents();
	},

	_onFileAdd : function(uploader, queue, file) {
		if (!this.fileStore.getById(file.getId())) {
			this.fileStore.add(new this.UploadFile(Ext.applyIf({
				nativeRef : null,
				percentage : 0
			}, file), file.getId()));
			return true;
		}
		return false;
	},

	_onQueueChange : function(uploader, queue, file) {

	},

	_onUploadStart : function(uploader, provider, file, statusCode, response) {
		var record = this.fileStore.getById(file.getId());
		record.set('status', file.getStatus());
		record.commit();
	},

	_onUploadProgress : function(uploader, provider, file, loadedSize, loadedPercentage, totalSize) {
		var record = this.fileStore.getById(file.getId());
		record.set('percentage', Math.round(loadedPercentage * 100));
		record.commit();
	},

	_onUploadFinish : function(uploader, provider, file, statusCode, response) {
		var record = this.fileStore.getById(file.getId());
		record.set('percentage', 100);
		record.set('status', file.getStatus());
		record.commit();
	},

	_fileProgressColumnRenderer : function(value, metadata, record, rowindex, colindex, store) {
		var cls = this.uploadCls;
		return String.format(['<div id="{0}-progress-bar" class="{1}"><div class="{2}" ',
			'style="width: {3}%;"></div></div>'].join(''),
			record.id, cls + '-progress-bar', cls + '-progress', record.get('percentage'));
	},

	_fileStatusColumnRenderer : function(value, metadata, record, rowindex, colindex, store) {
		
	},

	_bindBrowseButtonEvents : function() {
		this.mon(this.uploader, 'browsefilesover', function(event, el) {
			this.browseFilesButton.addClass(['x-btn-over', 'x-btn-focus']);
		}, this);
		this.mon(this.uploader, 'browsefilesout', function(event, el) {
			this.browseFilesButton.removeClass(['x-btn-over', 'x-btn-focus', 'x-btn-click']);
		}, this);
		this.mon(this.uploader, 'browsefilesclick', function(event, el) {
			this.browseFilesButton.addClass('x-btn-click');
		}, this);
	},

	onDestroy : function() {
		if (this.rendered) {
			this.uploader.destroy();
			this.uploader = null;
			delete this.uploader;
			Ext.destroyMembers(this, 'browseFilesButton', 'fileStore', 'filesGrid', 'UploadFile');
		}
		Ext.ux.jnap.uploader.UploadPanel.superclass.onDestroy.call(this);
	}

});

// register the component xtype
Ext.reg('uploadpanel', Ext.ux.jnap.upload.UploadPanel);