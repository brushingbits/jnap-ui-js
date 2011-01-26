
/**
 * @class Ext.ux.jnap.ExceptionDialog
 * @singleton
 */
Ext.ux.jnap.ExceptionDialog = function() {

	var dialog, panel, reportBtn;

	var getDialog = function() {
		if (!dialog) {
			dialog = new Ext.Window({
				
			});
		}
		return dialog;
	};

	var getPanel = function() {
		if (!panel) {
			panel = new Ext.Panel({
				
			});
		}
		return panel;
	};

	var getReportButton = function() {
		if (!reportBtn) {
			reportBtn = new Ext.Button({
				
			});
		}
		return reportBtn;
	};

	var lastReportHandler = null;

	return {

		defaultTitle : 'An unexpected exception was thrown.',

		show : function(exceptionObj, opts) {
			opts = opts || {};
			var panel = getPanel();
			var btn = getReportButton();
			if (Ext.isDefined(opts.reportHandler)) {
				lastReportHandler = opts.reportHandler;
				btn.on('click', lastReportHandler);
				panel.add(btn);
			} else {
				if (panel.findById(btn.id)) {
					if (lastReportHandler) {
						btn.un('click', lastReportHandler);
					}
					panel.remove(btn);
				} 
			}

			// update content

			// show dialog
			getWindow().show();
		}
	};

}();