Ext.ns('Ext.ux.jnap.util');
/**
 * @class Ext.ux.jnap.util.Defaults
 * @singleton
 * @since 1.0
 */
Ext.ux.jnap.util.Conventions = function() {

	var coc = this;

	return {

		/**
		 * The application context path. Defaults to ''.
		 */
		contextPath : '',

		autoApply : true,

		/**
		 * Maps a shorter base namespace, from 'Ext.ux.jnap' to just 'jnap'.
		 */
		enableNamespaceShortcut : function() {
			Ext.ns('jnap');
			jnap = Ext.ux.jnap;
		},

		setDefaultDataProperties : function() {
			Ext.data.JsonReader.prototype.root = 'modelList';
		},

		DEFAULT_PAGE_SIZE : 15,

		setDefaultPagingConfig : function(pageSize) {
			Ext.PagingToolbar.prototype.pageSize = pageSize;
			Ext.data.JsonReader.prototype.totalProperty = 'pagingData["totalResults"]';
		},

		setDefaultFormConventions : function() {
			Ext.form.ComboBox.prototype.queryParam = 'model.id';
		},

		applyAll : function() {
			coc.enableNamespaceShortcut();
			coc.setDefaultDataProperties();
			coc.setDefaultPagingConfig(coc.DEFAULT_PAGE_SIZE);
			Ext.ux.jnap.NotificationMgr.registerDefaultLoadingMsgOnAjax();
		}

	};
}();