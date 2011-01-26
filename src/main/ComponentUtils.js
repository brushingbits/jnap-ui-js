Ext.ns('Ext.ux.jnap');

Ext.ux.jnap.ComponentUtils = function() {

	return {

		hideParent : function(btn, evt, parentType) {
			var parent = btn.findParentByType(parentType);
			if (!parent) {
				throw String.format('The button {0} has no parent of type {1}.', btn.id, parentType);
			}
			parent.hide();
		},

		hideWindow : function(btn, evt) {
			Ext.ux.jnap.ComponentUtils.hideParent(btn, evt, Ext.Window);
		}

	};

}();