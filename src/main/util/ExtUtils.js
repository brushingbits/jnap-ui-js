Ext.ns('Ext.ux.jnap.util');

Ext.ux.jnap.util.ExtUtils = function() {

	var _syncFieldWrapSize = function(width, height) {
		this.getEl().setSize(width, height); // field scoped call
	};

	return {

		/**
		 * 
		 * @param field
		 * @returns
		 */
		wrapField : function(field) {
    		if (!field.isFormField) {
    			return undefined;
    		}
			if (!field.wrap) {
				field.wrap = field.getEl().wrap({cls: 'x-form-field-wrap'});
				field.positionEl = field.resizeEl = field.wrap;
				field.actionMode = 'wrap';
				field.onResize = field.onResize.createSequence(_syncFieldWrapSize, field);
			}
			return field.wrap;
		},

		createXhrObject : function() {
			var xhr = null;
			try {
				xhr = new XMLHttpRequest();
			} catch (e) {
				var activeX = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
				for (var i = 0; i < activeX.length; i++) {
					try {
						xhr = new ActiveXObject(activeX[i]);
						break;
					} catch(e) {
						// do nothing, try next activeX constructor and validate only at the end
					}
	            }
			}
			if (!xhr) {
				throw '[Ext.ux.jnap.util.ExtUtils.createXhrObject] This client has no support '
					+ 'for Ajax (XMLHttpRequest).';
			}
			return xhr;
		},

		/**
		 * 
		 */
		highlightKeyword : function(node, match, cls, deep) {
			if (node.nodeType != 3) {
				if (deep) {
					Ext.each(node.childNodes, function(child) {
						highlight(child, match, cls, deep);
					}, this);
				}
			} else {
				Ext.fly(node).replaceWith({
					tag : 'span',
					html : node.nodeValue.replace(new RegExp(match, 'gi'),
							String.format('<span class="{0}">{1}</span>', cls, match))
				});
			}
		}

	};
}();

// Alternative (shorter) name
