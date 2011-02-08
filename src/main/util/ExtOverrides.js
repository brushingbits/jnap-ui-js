(function() {

	// Ext.ToolTip anchor behaviour
	Ext.override(Ext.ToolTip, {
		initTarget : function(target) {
			var t;
			if ((t = Ext.get(target))) {
				var showEvents = this.showEvents || [];
				var hideEvents = this.hideEvents || [];
				if (this.target) {
					var tg = Ext.get(this.target);
					if (!this.suppressDefaultEvents) {
						this.mun(tg, 'mouseover', this.onTargetOver, this);
						this.mun(tg, 'mouseout', this.onTargetOut, this);
						this.mun(tg, 'mousemove', this.onMouseMove, this);
					}
					Ext.each(showEvents, function(item, i, array) {
						this.mun(tg, item, this.onTargetOver, this);
					}, this);
					Ext.each(hideEvents, function(item, i, array) {
						this.mun(tg, item, this.onTargetOut, this);
					}, this);
				}
				var events = {
					scope : this
				};
				if (!this.suppressDefaultEvents) {
					Ext.apply(events, {
						mouseover : this.onTargetOver,
						mouseout : this.onTargetOut,
						mousemove : this.onMouseMove
					});
				}
				Ext.each(showEvents, function(item, i, array) {
					events[item] = this.onTargetOver;
				}, this);
				Ext.each(hideEvents, function(item, i, array) {
					events[item] = this.onTargetOut;
				}, this);
				this.mon(t, events);
				this.target = t;
			}
			if (this.anchor) {
				this.anchorTarget = this.target;
			}
		}
	});

	// remove the need of success property on submit actions
	Ext.override(Ext.form.Action, {
		processResponse : function(response) {
			this.response = response;
			if (!response.responseText && !response.responseXML) {
				return true;
			}
			this.result = this.handleResponse(response); 
			this.result['success'] = (response.status >= 200 && response.status < 300);
			return this.result;
		}
	});

	// apply jnap conventions
	var coc = Ext.ux.jnap.util.Conventions;
	if (coc.autoApply) {
		coc.applyAll();
	}

})();