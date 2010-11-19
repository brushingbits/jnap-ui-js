/*
 * 
 */
(function() {

	var _ns = Ext.ux.jnap;

	// NotificationMessage
	if (_ns.NotificationMessage) {
		_ns.NotificationMessage.prototype.closeTitle = 'Fechar mensagem';
	}

	// Rating
	if (_ns.Rating) {
		_ns.Rating.prototype.clearText = 'Limpar minha avalia&ccedil;&atilde;o';
	}

	// CharactersLimitPlugin
	if (_ns.form.CharactersLimitPlugin) {
		_ns.form.CharactersLimitPlugin.prototype.text = 'Voc&ecirc; possui &lt;strong&gt;{0}&lt;/strong&gt; caracteres restantes';
	}

	// FormUtils
	if (_ns.form.FormUtils) {
		_ns.form.FormUtils.defaultSuccessMsg = 'Seus dados foram enviados com sucesso.';
		_ns.form.FormUtils.defaultInvalidMsg = 'Seu formul&aacute;rio cont&eacute;m dados inv&aacute;lidos, corrija-os e tente novamente.';
		_ns.form.FormUtils.defaultErrorMsg = 'Houve um erro de comunica&ccedil;&atilde;o com o servidor no processamento do seu formul&aacute;rio';
	}

	// RequiredFieldsPlugin
	if (_ns.form.RequiredFieldsPlugin) {
		_ns.form.RequiredFieldsPlugin.prototype.hintText = 'Os campos marcados com {0} s&atilde;o obrigat&oacute;rios';
	}

})();