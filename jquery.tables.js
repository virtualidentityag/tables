/**
 * @name			tables
 * @version			0.1
 * @lastmodified	2013-05-31
 * @package			html-css-js
 * @subpackage		jQuery plugin
 * @author			JW, VI
*/

;(function ($, window, document, undefined) {

	var pluginName = 'tables',
		defaults = {};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options) ;
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// methods
	var methods = {
		init: function() {
			var pluginInstance = this;
			var THIS = this;
			var $originalTable = this.$element;

			//add class align-right
			$originalTable.find('thead th').each(function(n) {
				var thClass = $(this).attr('class');
				if(thClass && thClass.indexOf('align') != -1) {
					$originalTable.find('tr').each(function () {
						$(this).find('td').eq(n).addClass(thClass);
					});
				}
			});
			$originalTable.find('.intermediate-caption').prev('tr').addClass('last');

			// sortable tables, not filterable
			if(this.$element.hasClass('sortable') && !this.$element.hasClass('filterable')){
				enquire.register('screen and (min-width: 768px)', {
					match: function() {
						// table: sortable
						// init tablesorter t
						THIS.$element.tablesorter();
					}
				}, true);
			}else if(this.$element.hasClass('filterable')){
				if(THIS.$element.data('tablesorter-filter-selector-wrapper') != undefined && THIS.$element.parents(THIS.$element.data('tablesorter-filter-selector-wrapper')).length){
					this.$wrapper = THIS.$element.parents(THIS.$element.data('tablesorter-filter-selector-wrapper'));
				}else{
					this.$wrapper = $('#main');
				}

				this.$input = this.$wrapper.find('.tablesorter-input');
				if(!this.$input.length){
					this.$input = this.$wrapper.find('input[type=text]');
				}

				this.reset = 'input.tablesorter-reset, button.tablesorter-reset';
				this.$reset = this.$wrapper.find(this.reset);
				if(!this.$reset.length){
					this.reset = 'input[type=reset], button[type=reset]';
					this.$reset = this.$wrapper.find(this.reset);
				}

				if(this.$element.hasClass('sortable')){
					// filterable and sortable table
					enquire.register('screen and (min-width: 768px)', {
						match: function() {
							// table: sortable
							// init tablesorter
							THIS.$element.tablesorter({
								widgets: ["filter"],
									widgetOptions : {
									// if true overrides default find rows behaviours and if any column matches query it returns that row
									filter_anyMatch : true,
									filter_columnFilters: false,
									filter_reset: THIS.reset
								}
							});

							THIS.initFilterableTable();
						}
					}, true);
				}else{
					// filterable tables, not sortable
					enquire.register('screen and (min-width: 768px)', {
						match: function() {
							var optionHeaders = {};
							THIS.$element.find('thead th').each(function(i){
								optionHeaders[i] = ({sorter: false});
							});

							// init tablesorter with filter widget
							THIS.$element.tablesorter({
								widgets: ["filter"],
									widgetOptions : {
									// if true overrides default find rows behaviours and if any column matches query it returns that row
									filter_anyMatch : true,
									filter_columnFilters: false,
									filter_reset: THIS.reset
								},
								// disable sorter for single columns
								headers: optionHeaders
							});

							THIS.initFilterableTable();
						}
					}, true);
				}
			}

			// destroy sortable table for mobile version
			if(this.$element.hasClass('filterable') || this.$element.hasClass('sortable')){
				enquire.register('screen and (max-width: 767px)', {
					match: function() {
						THIS.$element.trigger("destroy");
						$(THIS.$element.data('tablesorter-selector-hintnofilterresults')).hide();
					}
				}, true);
			}
			
			//adding class "state-flipped" when table is wider than its container to show tables in
			//mobile style (except in ie8)
			if (!$('html.lt-ie9').length) {
				enquire.register('screen and (min-width: 768px)', {
					match: function() {
						var $container = $originalTable.parent();
						pluginInstance.tableWidth = 0;
						$(window).on('resize.tables', function() {
							pluginInstance.flipState($container);
						});
						pluginInstance.flipState($container);
					},
					unmatch: function() {
						$(window).off('resize.tables');
						$('table.state-flipped').removeClass('state-flipped');
					}
				}, true);
			}

		},
		flipState: function($container) {
			var pluginInstance = this;
			var $originalTable = this.$element;

			if ($originalTable.hasClass('state-flipped')) {
				if (pluginInstance.tableWidth < $container.width()) {
					$originalTable.removeClass('state-flipped');
				}
			} else {
				if ($originalTable.width() > $container.width()) {
					pluginInstance.tableWidth = $originalTable.width();
					$originalTable.addClass('state-flipped');
				}
			}
		},
		initToggleHint: function(){
			// show/hide hint if there are no filter results
			var THIS = this;
			if(this.$element.data('tablesorter-selector-hintnofilterresults') != undefined && $(this.$element.data('tablesorter-selector-hintnofilterresults')).length){
				this.$element.on('filterEnd', function(){
					var $hint = $(THIS.$element.data('tablesorter-selector-hintnofilterresults'));
					var visibleRows = THIS.$element.find('tbody tr').not('.filtered').length;
					(visibleRows == 0)
						? $hint.show()
						: $hint.hide();
				});
			}
		},
		initFilterableTable: function(){
			var THIS = this;
			// add event handler for input field for filtering table
			if(this.$input.length){
				// prevent sending form on enter
				this.$input.on('keypress', function(e){
					if(e.keyCode == 13){
						return false;
					}
				});

				// manage disabled filter button if exists
				if(this.$reset.length){
					this.$input.on('keyup', function(e){
						($(this).val() == '')
							? THIS.$reset.attr('disabled', 'disabled')
							: THIS.$reset.removeAttr('disabled');
					});

					// disable filter button on form reset and on click
					this.$reset.parents('form').on('reset', function(){
						THIS.$reset.attr('disabled', 'disabled');
					});
				}

				// connect filter input with table
				this.$input.on('keyup', function(e) {
					THIS.$element.trigger('search', [ [this.value] ]);
				});
			}
			this.initToggleHint();
		}
	};

	// event handlers
	var eventhandlers = {
		onEvent: function(e) {
		}
	};

	// build
	$.extend(Plugin.prototype, methods, eventhandlers);

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	}

})(jQuery, window, document);
