var emptySignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAADGCAYAAAA5QY5GAAAAAXNSR0IArs4c6QAABLpJREFUeF7t2omNhTAMQEHSf9FBPpvIbAc7/wmB7XPvvZ8/AgSeFjgeBE///v55AingQSAEAgQ8CDRAgIA3Ag0QIODTQAMECJgRaIAAAcNCDRAgUAK2BkogQMCDQAMECHgj0AABAj4NNECAgBmBBggQMCzUAAECtgYaIECgBawPpUCAgPWhBggQsD7UAAEC1ocaIEDA+lADBAhYH2qAAAHrQw0QIGB9qAECBEbAHYEWCBBwR6ABAgTcEWiAAAF3BBogQMAdgQYIEHBHoAECBNwRaIAAAXcEGiBAwB2BBggQWAEHRWIgQMBBkQYIEHBQpAECBBwUaYAAgRAwI9ABAQIeBBogQMAbgQYIEPBpoAECBMwINECAQAoYFgqBAAEPAg0QIOCNQAMECPg00AABAmYEGiBAwLBQAwQIlICtgRIIEPAg0AABAt4INECAgE8DDRAgYEagAQIEDAs1QICArYEGCBBoAetDKRAgYH2oAQIErA81QICA9aEGCBCwPtQAAQLWhxogQMD6UAMECFgfaoAAgRFwR6AFAgTcEWiAAAF3BBogQMAdgQYIEHBHoAECBNwRaIAAAXcEGiBAwB2BBggQcEegAQIEVsBBkRgIEHBQpAECBBwUaYAAAQdFGiBAIATMCHRAgIAHgQYIEPBGoAECBHwaaIAAATMCDRAgkAKGhUIgQMCDQAMECHgj0AABAj4NNECAgBmBBggQMCzUAAECJWBroAQCBDwINECAgDcCDRAg4NNAAwQImBFogAABw0INECBga6ABAgRawPpQCgQIWB9qgAAB60MNECBgfagBAgSsDzVAgID1oQYIELA+1AABAtaHGiBAYATcEWiBAAF3BBogQMAdgQYIEHBHoAECBNwRaIAAAXcEGiBAwB2BBggQcEegAQIE3BFogACBFXBQJAYCBBwUaYAAAQdFGiBAwEGRBggQCAEzAh0QIOBBoAECBLwRaIAAAZ8GGiBAwIxAAwQIpIBhoRAIEPAg0AABAt4INECAgE8DDRAgYEagAQIEDAs1QIBACdgaKIEAAQ8CDRAg4I1AAwQI+DTQAAECZgQaIEDAsFADBAjYGmiAAIEWsD6UAgEC1ocaIEDA+lADBAhYH2qAAAHrQw0QIGB9qAECBKwPNUCAgPWhBggQGAF3BFogQMAdgQYIEHBHoAECBNwRaIAAAXcEGiBAwB2BBggQcEegAQIE3BFogAABdwQaIEBgBRwUiYEAAQdFGiBAwEGRBggQcFCkAQIEQsCMQAcECHgQaIAAAW8EGiBAwKeBBggQMCPQAAECKWBYKAQCBDwINECAgDcCDRAg4NNAAwQImBFogAABw0INECBQArYGSiBAwINAAwQIeCPQAAECPg00QICAGYEGCBAwLNQAAQK2BhogQKAFrA+lQICA9aEGCBCwPtQAAQLWhxogQMD6UAMECFgfaoAAAetDDRAgYH2oAQIERsAdgRYIEHBHoAECBNwRaIAAAXcEGiBAwB2BBggQcEegAQIE3BFogAABdwQaIEDAHYEGCBBYAQdFYiBAwEGRBggQcFCkAQIEHBRpgACBEDAj0AEBAh4EGiBAwBuBBggQ8GmgAQIEzAg0QIBAChgWCoEAge8H2jkV3CR6B4QAAAAASUVORK5CYII=";

//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

var allElements;
var pages;
var totalPageCount;

const isCanvasBlank = (cnv) => {
  return cnv.toDataURL() === blankImg;
}

const get_and_create_answers = () => {
	// finding correct element per page;
	var pageElements = [];

	allElements.forEach(element => {
		for(var key in element) {
			if (['ffField', 'slField', 'nestedSlField', 'signField'].includes(key)) {
				var data = element[key];
				if (data['spec']['page'] === ($("fieldset").index(current_fs) + 1 )) {
					pageElements.push(element);
				}
			}
		}
	});

	// before moving next, check form validation
	var validationFlag = true;
	var requiredFields =  current_fs.find('.value_required_field');

	requiredFields.each(index => {
		if (requiredFields.eq(index).val() === '') {
			validationFlag = false;
		}
	});

	// check signature validation
	if (current_fs.find('#signature-pad').length > 0) {
		if (current_fs.find('#signature-pad').signature('toDataURL') === emptySignature) {
			validationFlag = false;
		} else {
			pageElements.forEach(element => {
				if (element['signField']) {
					element['signField']['signature_base64'] = current_fs.find('#signature-pad').signature('toDataURL')
				}
			});
		}
	}
	
	if (!validationFlag) return false;
	
	/*** generate filled_form.json data part ***/
	requiredFields.each(index => {
		const field = requiredFields.eq(index);
		const value = field.val();
		var elementId = field.attr('elementid');

		if (elementId) {
			var element = pageElements[elementId];
			if (element['ffField']) {
				element['ffField']['text'] = value;
			}
			
			if (element['slField']) {
				element['slField']['selection'] =  {index: value};
			}

			if (element['nestedSlField']) {
				var nestedIndex = field.attr('nestedindex');
				var answers = element['nestedSlField']['sub_field_selections'] ? element['nestedSlField']['sub_field_selections'] : [];

				if (element['nestedSlField']['spec']['subFieldSpecs'].length === answers.length) {
					answers = [];
				}
				
				answers.push({index: value});
				element['nestedSlField']['sub_field_selections'] = answers;
			}
		} else {
			var prevField = field.prev();
			elementId = prevField.attr('elementid');

			var element = pageElements[elementId];
			if (element['slField']) {
				element['slField']['selection']['explanation'] = value;
			}

			if (element['nestedSlField']) {
				var answers = element['nestedSlField']['sub_field_selections'] ? element['nestedSlField']['sub_field_selections'] : [];
				var nestedIndex = prevField.attr('nestedindex');
				answers[nestedIndex]['explanation'] = value;

				element['nestedSlField']['sub_field_selections'] = answers;
			}
		}
	});
}

$(document).on('click', '.next', function(){
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();

	if (get_and_create_answers() === false) return false;

	if(animating) return false;
	animating = true;

	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$(document).on('click', '.previous', function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$(document).on('click', '.submit', async function(e){
	e.preventDefault();

	current_fs = $(this).parent();
	if (get_and_create_answers() === false) return false;

	console.log('Result printing');
	console.log({ fields: allElements });
	const isAuthenticated = await auth0.isAuthenticated();
	if (isAuthenticated) {
		const user = await auth0.getUser();
		const { email } = user;
		localStorage.setItem(`${email}_form`, JSON.stringify({ fields: allElements }));

		$.toast({
			text: 'Thank you for filling out this form.',
			icon: 'info',
			loader: true,
			position: 'top-right',
			hideAfter: 3000,
			afterHidden: function() {
				logout();
			}
		})
	}
});

$(document).on('change', 'select.value_required_field ', function(e) {
	var value = $(this).val();
	var option = $(this).children("option:selected");
	var next = $(this).next();

	if (value === '-') {
		if (next.hasClass('value_required_field')) {
			next.remove();
		}
	} else {
		var needsExplanation = option.attr('needsexplanation');
		if (needsExplanation === 'true') {
			$(this).after(`<input type="text" class="value_required_field slField-${$("fieldset").index(current_fs)}-value" />`);
		} else {
			if (next.hasClass('value_required_field')) {
				next.remove();
			}
		}
	}
});

const generateFieldSet = (elements, pageIndex) => {
	$("#msform").append(
		`
			<fieldset>
				<h2 class="fs-title">Step ${pageIndex}</h2>
				<h3 class="fs-subtitle"></h3>
				
				<div class="step-${pageIndex}"></div>
				${
					pageIndex === 1 && pageIndex === totalPageCount ? (
						`<input type="submit" name="submit" class="submit action-button" value="Submit" />`
					) : (
						pageIndex === 1 ? (
							`<input type="button" name="next" class="next action-button" value="Next" />`
						) : (
							pageIndex === totalPageCount ? (
								`
									<input type="button" name="previous" class="previous action-button" value="Previous" />
									<input type="submit" name="submit" class="submit action-button" value="Submit" />
								`
							) : (
								`
									<input type="button" name="previous" class="previous action-button" value="Previous" />
									<input type="button" name="next" class="next action-button" value="Next" />
								`
							)
						)
					)
				}
			</fieldset>
		`
	)

	var stepWrapper = `.step-${pageIndex}`;
	var text = '';
	elements.forEach((element, elementID) => {
		for(var key in element) {
			if (['ffField', 'slField', 'nestedSlField', 'signField'].includes(key)) {
				var data = element[key];
				var spec = data.spec;

				if (key === 'ffField') {
					// normal text input field
					text += `
						<div class="text-label">${spec.text}</div>
						<input type="text" name="step-${pageIndex}-text" placeholder="${spec.text}" class="value_required_field ffField-${pageIndex}-value" elementid="${elementID}" />
					`;
				}

				if (key === 'slField') {
					// a select box
					var options = spec.options;
					var optionsContents = '';

					options.forEach((option, index) => {
						optionsContents += `<option value="${index}" needsExplanation="${option.needsExplanation ? 'true': 'false'}">${option.text}</option>`;
					});
					
					text += `
						<div class="text-label">${spec.text}</div>
						<select class="value_required_field slField-${pageIndex}-value" elementid="${elementID}">
							<option value="" selected>----</option>
							${optionsContents}
						</select>
					`;
				}

				if (key === 'nestedSlField') {
					// many select boxes
					var subSpecs = spec.subFieldSpecs;
	
					var optionsContents = '';

					subSpecs.forEach((specs, index) => {
						var options = specs.options;
						var optionContents = '';
						options.forEach((option, index) => {
							optionContents += `<option value="${index}" needsExplanation="${option.needsExplanation ? 'true': 'false'}">${option.text}</option>`;
						});

						optionsContents += `
							<div>${specs.text}</div>
							<select class="value_required_field" elementid="${elementID}" nestedindex="${index}">
								<option value="" selected>----</option>
								${optionContents}
							</select>
						`;
					});					
					
					text += `
						<div class="text-label">${spec.text}</div>
						<div class="multiselect multiselect-${pageIndex}">${optionsContents}</div>
					`;
				}

				if (key === 'signField') {
					// sign in drawer - canvas
					text += `
						<div class="text-label">${spec.text}</div>
						<div id="signature-pad"></div>
						<input type="button" value="Reset" id="resetSign">
					`;
				}
			}
		}
	});

	$(stepWrapper).append(text);

	// Run signature jquery plugin.
	var sigpad = $('#signature-pad').signature({
		syncField: '#signature',
		syncFormat: 'PNG',
		background: '#ffffff'
	});

	$('#resetSign').click(function(e) {
		e.preventDefault();
		sigpad.signature('clear');
		$("#signature-pad").val('');
	});

	// Populate previously saved values
	elements.forEach((element, elementID) => {
		for(var key in element) {
			if (['ffField', 'slField', 'nestedSlField', 'signField'].includes(key)) {
				var data = element[key];
				if (key === 'ffField') {
					// normal text input field value
					var value = data.text;
					if (value) {
						$(`input[name="step-${pageIndex}-text"]`).val(value);
					}
				}

				if (key === 'slField') {
					var value = data.selection;
					if (value) {
						var { index, explanation } = value;
						if (index) {
							var target = $(`select[elementid="${elementID}"]`).val(index).change();
							if (explanation) {
								target.next().val(explanation);
							}
						}
					}
				}

				if (key === 'nestedSlField') {
					var values = data.sub_field_selections;

					if (values) {
						values.forEach((value, nestedIndex) => {
							var { index, explanation } = value;
							if (index) {
								var target = $(`select[elementid="${elementID}"][nestedindex="${nestedIndex}"]`).val(index).change();
								if (explanation) {
									target.next().val(explanation);
								}
							}
						})
					}
				}

				if (key === 'signField') {
					var value = data.signature_base64;
					if (value) {
						$('#signature-pad').signature('draw', value);
					}
				}
			}
		}
	});
}

const startLogic = () => {
	console.log('starting logic');
	// get total page numbers;
	pages = [];
	allElements.forEach(element => {
		for(var key in element) {
			if (['ffField', 'slField', 'nestedSlField', 'signField'].includes(key)) {
				var data = element[key];
				pages.push(data['spec']['page']);
			}
		}
	});

	pages = [... new Set(pages)];
	totalPageCount = pages.length;

	// generate progress bar
	pages.forEach(page => {
		if (page === 1) {
			$("#progressbar").append(`<li class='active' style="width: ${( 100 / totalPageCount).toFixed(2)}%"></li>`);
		} else {
			$("#progressbar").append(`<li style="width: ${( 100 / totalPageCount).toFixed(2)}%"></li>`);
		}
	});

	pages.forEach(page => {
		// finding correct element per page;
		var pageElements = [];
		allElements.forEach(element => {
			for(var key in element) {
				if (['ffField', 'slField', 'nestedSlField', 'signField'].includes(key)) {
					var data = element[key];
					if (data['spec']['page'] === page) {
						pageElements.push(element);
					}
				}
			}
		});

		generateFieldSet(pageElements, page);
	});
}

const startAction =  async (auth0) => {
	const response = await fetch('./form.json');
  const formConfig = await response.json();

	if (auth0) {
		const isAuthenticated = await auth0.isAuthenticated();
		if (isAuthenticated) {
			const user = await auth0.getUser();
			const { email } = user;

			allElements = localStorage.getItem(`${email}_form`) ? JSON.parse(localStorage.getItem(`${email}_form`)) : formConfig;
			allElements = allElements.fields;

			startLogic();
		}
	}
}
