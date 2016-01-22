function autoFillFromURL() {
   $('#is' + $.QueryString["type"]).click();
   
   setTimeout(function() {
      $('#arv').attr('value', $.QueryString["arv"]).change().blur();
      $('#taxes').attr('value', $.QueryString["taxes"]).change().blur();
      $('#rental_rate').attr('value', $.QueryString["rent"]).change().blur();
      optimize();
   }, 1);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function auction_updateGradeButton() {
   $('#grade').removeClass('badge-important').removeClass('badge-warning').removeClass('badge-success')
   if ($('.label-important').not('#grade').length == 0) {
      $('#grade').html('Status: GOOD').addClass('badge-success');
   } else if ($('.label-important').not('#grade').length == 1) {
      $('#grade').html('Status: WARN').addClass('badge-warning');
   } else {
      $('#grade').html('Status: BAD').addClass('badge-important');
   }
}

function floorTo500(number) {
   number *= 0.001;
   rounded = Math.round(number);
   newNumber = ((rounded >= number) ? ((rounded - 0.5) * 1000) : (rounded * 1000));
   return (newNumber == (number * 1000)) ? newNumber - 500 : newNumber;
}

function nl2br (str, is_xhtml) {   
   var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
   return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getValue(what) {
   // THIS IS A TEST
   return $('#' + what).attr('value').replace(/[^\d\.-]/g,'') / 1;
}

function getContent(what) {
   // THIS IS A TEST
   return $('#' + what).html().replace(/[^\d\.-]/g,'') / 1;
}  

function colorize(what, op, goal) {
   switch (op) {
      case 'gt':
         if (getContent(what) >= goal) {
            $('#' + what).removeClass('label-important').addClass('label label-success');
         } else {
            $('#' + what).removeClass('label-success').addClass('label label-important');
         }
      break;

      case 'lt':
         if (getContent(what) <= goal) {
            $('#' + what).removeClass('label-important').addClass('label label-success');
         } else {
            $('#' + what).removeClass('label-success').addClass('label label-important');
         }
      break;
   }
}

function getEffectiveRate(rate) {
   rate /= 1
   rate /= (rate < 1) ? 1 : 100;
   effective = 0
   add = rate

   for (a = 0; a < 5; a++) {
       effective += add
       add = add * rate
   }
   effective = Math.round(effective * 1000000) / 10000;
   return effective
}

function payment(b, n, a)
{
	var r = b/(12*100);
	var p = (a * r *Math.pow((1+r),n))/(Math.pow((1+r),n)-1);
	var prin = Math.ceil(p);
	return prin;
}

function balance(rate, num, value, period)
{
	var r = rate/(12*100);
	
	remaining = (value * Math.pow(1 + r, period)) - (payment(rate, num, value) * ((Math.pow(1 + r, period) - 1) / r))
	return Math.ceil(remaining);
}

function auction_writeMY(value) {
   return '<span class="label dollar">' + value + '</span> <span class="label label-inverse dollar">' + (value * 12) + '</span>';
}

function auction_getInputs() {
   input = Array();
   get = Array('arv', 'taxes', 'rental_rate', 'lender_points', 'lender_rate', 'hold_time', 'refinance_points', 'refinance_rate', 'refinance_percentage', 'maintenance', 'vacancy', 'monthly_expenses', 'value_appreciation', 'rent_appreciation', 'expenses_appreciation', 'closing_costs', 'purchase_price', 'repairs', 'acquisition_fee', 'my_cash', 'partner_cash', 'partner_split');
   for (item in get) {
      input[get[item]] = getValue(get[item]) / 1;
   }
   
   return input;
}

function calculateScenario() {
   inputs = auction_getInputs();
   
   inputs['maintenance_perc']       = inputs['maintenance'];
   inputs['vacancy_perc']           = inputs['vacancy'];
   inputs['cash_available']         = (inputs['my_cash'] / 1) + (inputs['partner_cash'] / 1);
   inputs['effective_lender_rate']  = getEffectiveRate((inputs['lender_rate'] / 12 * inputs['hold_time']) + (inputs['lender_points'] / 1));
   inputs['closing_costs']          = (inputs['closing_costs'] / 1) + Math.ceil(inputs['refinance_points'] / 100 * inputs['arv'] * inputs['refinance_percentage'] / 100);
   inputs['total_cost_to_buy']      = inputs['purchase_price'] + inputs['repairs'] + inputs['acquisition_fee'] + inputs['closing_costs'];
   inputs['cash_needed']            = inputs['total_cost_to_buy'] - inputs['cash_available'];
   inputs['lender_costs']           = Math.ceil(((inputs['effective_lender_rate'] / 100)) * inputs['cash_needed']);
   inputs['total']                  = inputs['cash_needed'] + inputs['lender_costs'];
   
   if ($('#isUPG').is(':checked')) {
      $('#refinance_percentage').attr('value', Math.round(inputs['total'] / inputs['arv'] * 10000) / 100);
   }
   
   inputs['p1_ltv']                 = Math.round(inputs['total'] / inputs['arv'] * 10000) / 100;
   inputs['refi_amount']            = Math.round(inputs['refinance_percentage'] / 100 * inputs['arv']);
   inputs['refi_point_cost']        = Math.round(inputs['refinance_points'] / 100 * inputs['refi_amount']);
   inputs['refi_points']            = '$' + addCommas(inputs['refi_point_cost']) + ' (' + inputs['refinance_points'] + '%)';
   inputs['refi_cashout']           = inputs['refi_amount'] - inputs['total'];
   inputs['taxes']                  = ($('#isILC').attr('checked')) ? 0 : Math.ceil(inputs['taxes'] / 12);
   inputs['vacancy']                = Math.ceil(inputs['rental_rate'] * inputs['vacancy'] / 100);
   inputs['maintenance']            = Math.ceil(inputs['rental_rate'] * inputs['maintenance'] / 100);
   inputs['total_expenses']         = (inputs['maintenance'] / 1) + (inputs['vacancy'] / 1) + (inputs['taxes'] / 1) + (inputs['monthly_expenses'] / 1)
   inputs['noi']                    = Math.ceil(inputs['rental_rate'] - inputs['total_expenses']);
   inputs['payment']                = ($('#isOC').is(':checked')) ? getValue('oc_mon_payment') : payment(inputs['refinance_rate'], 360, inputs['refi_amount']);
   inputs['ncf']                    = inputs['noi'] - inputs['payment'];
   
   if ($('#isUPG').is(':checked')) {
      inputs['upg_mon_payment']     = getValue('upg_mon_payment');
      inputs['ncf']                 = inputs['ncf'] - inputs['upg_mon_payment'];
   }   
   
   inputs['my_cf']                  = Math.floor((100 - inputs['partner_split']) * inputs['ncf'] / 100);
   inputs['partner_cf']             = Math.floor(inputs['partner_split'] * inputs['ncf'] / 100);
   inputs['my_cash_in']             = inputs['my_cash'] - inputs['refi_cashout'];
   inputs['my_coc']                 = (inputs['my_cash_in'] <= 0) ? '∞' : Math.round(inputs['my_cf'] / inputs['my_cash_in'] * 120000) / 100;
   inputs['partner_coc']            = (inputs['partner_cash'] <= 0) ? '∞' : Math.round(inputs['partner_cf'] / inputs['partner_cash'] * 120000) / 100;
   
   if ($('#isOC').is(':checked')) {
      inputs['oc_down']             = getValue('my_cash') - getValue('repairs') - getValue('acquisition_fee') - getValue('closing_costs');
      inputs['oc_mon_payment']      = getValue('oc_mon_payment');
      inputs['oc_cf']               = getValue('oc_mon_payment') * getValue('oc_balloon_year') * 12;
      inputs['oc_balloon']          = getValue('purchase_price') - (inputs['oc_down'] + inputs['oc_cf']);
      inputs['oc_balloon_app']      = (getValue('oc_balloon_year') > 3) ? Math.pow((1 + (getValue('value_appreciation') / 100)), getValue('oc_balloon_year') - 3) : 1;
      inputs['oc_balloon_val']      = floorTo500(inputs['oc_balloon_app'] * getValue('arv'));
      inputs['oc_btv']              = Math.round(inputs['oc_balloon'] / (getValue('arv') * inputs['oc_balloon_app']) * 1000) / 10;
      inputs['oc_total']            = getValue('purchase_price');
      
      $('#oc_stats:hidden').toggle();
   } else if ($('#isUPG').is(':checked')) {
      inputs['oc_down']             = getValue('upg_down_payment');
      inputs['oc_mon_payment']      = input['upg_mon_payment'];
      inputs['oc_cf']               = input['oc_mon_payment'] * getValue('upg_balloon_year') * 12;
      inputs['oc_balloon']          = getValue('purchase_price') - (inputs['oc_down'] + inputs['oc_cf']);
      inputs['oc_balloon_app']      = (getValue('upg_balloon_year') > 3) ? Math.pow((1 + (getValue('value_appreciation') / 100)), getValue('upg_balloon_year') - 3) : 1;
      inputs['oc_balloon_val']      = floorTo500(inputs['oc_balloon_app'] * getValue('arv'));
      inputs['oc_btv']              = Math.round(inputs['oc_balloon'] / (getValue('arv') * inputs['oc_balloon_app']) * 1000) / 10;
      inputs['oc_total']            = getValue('purchase_price');
      
      $('#oc_stats:hidden').toggle();
   } else {
      $('#oc_stats:visible').toggle();
   }
   
   for (input in inputs) {
      $('#mt_' + input).html(inputs[input]);
      $('#mt_' + input + '.my').html(auction_writeMY(inputs[input]));
   }
   
   cm = Array();
   cm['amount_to_borrow'] = inputs['total'];
   cm['p1_ltv'] = inputs['p1_ltv'];
   cm['profit_taking'] = '$' + addCommas(inputs['acquisition_fee']) + ' & $' + addCommas(inputs['refi_cashout']);
   cm['partner_cf'] = inputs['partner_cf'];
   cm['inv_coc'] = inputs['partner_coc'];
   cm['my_coc'] = inputs['my_coc'];
   cm['imm_equity'] = Math.round(inputs['arv'] * (100 - inputs['refinance_percentage']) / 100);
   cm['p1_profit'] = ($('#isILC').attr('checked')) ? Math.floor((inputs['acquisition_fee'] / 1) + (inputs['refi_cashout'] / 1) + (inputs['arv'] * 1.08 * 0.08)) : Math.floor((inputs['acquisition_fee'] / 1) + (inputs['refi_cashout'] / 1));
   cm['p2_cf'] = inputs['ncf'] * 12 * (100 - inputs['partner_split']) / 100;
   
   cumcashflow = 0;
   $('td[id^="rents"]').each(function() {
      row = $(this).attr('id').substring(5);
      year = 0;
      if (row > 2) {
         year = row - 3;
      }
      
      rents = Math.round(inputs['rental_rate'] * Math.pow(1 + (getValue('rent_appreciation') / 100), year));
      expenses = Math.round(inputs['total_expenses'] * Math.pow(1 + (getValue('expenses_appreciation') / 100), year));
      cashflow = rents - expenses - inputs['payment'];
      cumcashflow += (cashflow * 12);
      value = Math.round(inputs['arv'] * Math.pow(1 + (getValue('value_appreciation') / 100), year));
      
      if ($('#isBFR').is(':checked')) {
         equity = value - balance(inputs['refinance_rate'], 360, inputs['refi_amount'], row * 12) - cm['imm_equity'];
      }

      if ($('#isOC').is(':checked')) {
         equity = value - (getValue('partner_cash') - (getValue('oc_mon_payment') * 12 * row));
      }
      
      if ($('#isWS').is(':checked')) {
         equity = value - getValue('partner_cash');
      }
      
      cash = Math.round((equity + cumcashflow) * (100 - inputs['partner_split']) / 100);
      anncoc = Math.round((equity + cumcashflow) * (100 - inputs['partner_split']) / inputs['my_cash'] / row * 100) / 100;
      
      $('#rents' + row).html(rents);
      $('#expenses' + row).html(expenses);
      $('#cashflow' + row).html(cashflow);
      $('#cf' + row).html(cumcashflow);
      $('#eq' + row).html(equity);
      $('#cash' + row).html(cash);
      $('#coc' + row).html(anncoc);
   });
   
   cm['10yr_eq'] = equity * (100 - inputs['partner_split']) / 100;
   cm['10yr_cf'] = cumcashflow * (100 - inputs['partner_split']) / 100;
   cm['10yr_profit'] = cm['10yr_eq'] + cm['10yr_eq'] + cm['imm_equity'] + cm['p1_profit']
   
   for (input in cm) {
      $('#cm_' + input).html(cm[input]);
   }
   
   $('span.percent').each(function() {
      $(this).html(addCommas($(this).html()) + '%')
   });
   
   $('span.dollar').each(function() {
      $(this).html('$' + addCommas($(this).html()))
   });
   
   $('td.dollar').each(function() {
      $(this).html('$' + addCommas($(this).html()))
   });
   
   $('td.percent').each(function() {
      $(this).html(addCommas($(this).html()) + '%')
   });
   
   if ($('#isBFR').is(':checked')) {
      coc_target = getValue("bfr_coc_target");
      cm_p1_profit = 1500;
      cm_p2_cf = 1200;
      mt_my_coc = 25;
   }
   
   if ($('#isOC').is(':checked')) {
      coc_target = -1;
      cm_p1_profit = -1;
      cm_p2_cf = (getValue('my_cash') + getValue('repairs')) * getValue('oc_min_coc') / 100;
      mt_my_coc = getValue('oc_min_coc');
      
      colorize('mt_oc_balloon', 'lt', getContent('mt_oc_balloon_val') * 0.75);
   }
   
   if ($('#isWS').is(':checked')) {
      coc_target = getValue("ws_coc_target");
      cm_p1_profit = getValue("acquisition_fee");
      cm_p2_cf = -1;
      mt_my_coc = -1;
   }

   if ($('#isUPG').is(':checked')) {
      coc_target = -1;
      cm_p1_profit = -1;
      cm_p2_cf = getValue('my_cash');
      mt_my_coc = -1;
      
      colorize('mt_oc_balloon', 'lt', getContent('mt_oc_balloon_val') * 0.75);
   }
   
   colorize('mt_p1_ltv', 'lt', inputs['refinance_percentage']);
   colorize('mt_refi_cashout', 'gt', 0);
   colorize('mt_partner_coc', 'gt', coc_target);
   colorize('cm_p1_profit', 'gt', cm_p1_profit);
   colorize('cm_p2_cf', 'gt', cm_p2_cf);
   
   if (getContent('mt_my_coc') == "∞") {
      $('#mt_my_coc').addClass('label label-success');
   } else {
      colorize('mt_my_coc', 'gt', mt_my_coc);
   }
   
   auction_updateGradeButton();
   if ($('#refresh').attr('value') == 1) {
      setTimeout(function() {
         $('#refresh').attr('value', 1)
      }, 100);
      $('#refresh').attr('value', 0).change();
   }
}

function makePrintable() {
   $('div.row-fluid').eq(3).toggle()
   $('div.sub_nav').remove();
   $('div.side_nav').remove();
   $('div.navbar').remove();
   $('div.options_cont').remove();
   $('footer').remove();
   $('hr').remove();
   
   $('body').css({
      'background': 'none',
      'color': '#000000'
   });

   $('h3').css({
      'color': '#FFFFFF'
   });
   
   $('div.span9').css({
       'position': 'absolute',
       'top': '1px',
       'left': '1px',
       'width': '900px',
       'margin-left': '0px'
   })
   
   $('#print').hide();
   $('#savedBadge').hide();
   
   $('a img').parent().remove();  
   setTimeout("window.print(); window.close()", 500);
}

function switchToBFR() {
   reInit();
   
   $('span#bfr_exit').show()
   $('#isBFR').attr('checked', true).change().blur();
   
   if ($('#rental_rate').is(':disabled')) {
      $('#rental_rate').attr('value', 0).change().blur();
   }

   $('#lender_points').attr('value', 3).change().blur();
   $('#refinance_points').attr('value', 2.2).change().blur();
   $('#lender_rate').attr('value', 12).change().blur();
   $('#refinance_rate').attr('value', 4.5).change().blur();
   $('#hold_time').attr('value', 6).change().blur();
   $('#maintenance').attr('value', 19).change().blur();
   $('#vacancy').attr('value', 10).change().blur();
   $('#monthly_expenses').attr('value', 30).change().blur();
   $('#value_appreciation').attr('value', 3).change().blur();
   $('#rent_appreciation').attr('value', 3).change().blur();
   $('#expenses_appreciation').attr('value', 2).change().blur();
   $('#partner_split').attr('value', 50).change().blur();
   $('#refinance_percentage').attr('value', 70).change().blur();
   
   $('input#arv').unbind('change');
   optimize();
}

function switchToOC() {
   reInit()
   
   $('span#oc_exit').show()
   $('#isOC').attr('checked', true).change().blur();
   
   if ($('#rental_rate').is(':disabled')) {
      $('#rental_rate').attr('value', 0).change().blur();
   }

   $('#refinance_rate').attr('value', 0.01).change().blur().attr('disabled', true);
   $('#refinance_points').attr('value', 0).change().blur().attr('disabled', true);
   $('#refinance_percentage').attr('value', 0).change().blur().attr('disabled', true);
   $('#hold_time').attr('value', 0).change().blur().attr('disabled', true);
   $('#partner_split').attr({'value': 0, 'disabled': true}).change().blur();
   $('#lender_points').attr('value', 0).change().blur().attr('disabled', true);
   $('#lender_rate').attr('value', 0).change().blur().attr('disabled', true);
   $('#acquisition_fee').attr('value', 0).change().blur().attr('disabled', true);
   $('#partner_cash').attr('value', getValue('arv')).change().blur().attr('disabled', true);

   $('#maintenance').attr('value', 19).change().blur();
   $('#vacancy').attr('value', 10).change().blur();
   $('#monthly_expenses').attr('value', 30).change().blur();
   $('#value_appreciation').attr('value', 3).change().blur();
   $('#rent_appreciation').attr('value', 3).change().blur();
   $('#expenses_appreciation').attr('value', 2).change().blur();
   $('#closing_costs').attr('value', 800).change().blur();

   $('#my_cash').attr('value', 2 * (getValue('acquisition_fee') + getValue('repairs'))).change().blur();
   $('#oc_mon_payment').change().blur();
   $('input#arv').unbind('change');
   $('#partner_cash').prev().html('Owner Carry: ');
   
   $('#refresh').change(function() {
      setTimeout(function() {
         $('#partner_cash').attr('value', getValue('partner_cash') - getContent('cm_p1_profit') - getValue('my_cash') - getValue('repairs')).change().blur();
      }, 0);
   }).change();
   
   optimize();
}

function switchToWS() {
   reInit()
   
   $('span#ws_exit').show()
   $('#isWS').attr('checked', true);
   
   $('#lender_points').attr('value', 0).change().blur().attr('disabled', true);
   $('#refinance_points').attr('value', 0).change().blur().attr('disabled', true);
   $('#lender_rate').attr('value', 0).change().blur().attr('disabled', true);
   $('#refinance_rate').attr('value', 0.01).change().blur().attr('disabled', true);
   $('#hold_time').attr('value', 0).change().blur().attr('disabled', true);
   $('#refinance_percentage').attr('value', 0).change().blur().attr('disabled', true);
   $('#closing_costs').attr('value', 500).change().blur().attr('disabled', true);
   $('#my_cash').attr('value', 0).change().blur().attr('disabled', true);
   $('#partner_split').attr('value', 100).change().blur().attr('disabled', true);
   $('#value_appreciation').attr('value', 3).change().blur();
   $('#rent_appreciation').attr('value', 3).change().blur();
   $('#expenses_appreciation').attr('value', 2).change().blur();
   
   optimize();
}

function switchToUPG() {
   reInit()
   
   $('span#upg_exit').show()
   $('#isUPG').attr('checked', true);
   
   $('#mt_upg_mon_payment').parents('div').eq(0).show().prev().prev().html('Lender Payment:');
   
   $('#acquisition_fee').attr('value', 1500).change().blur();
   $('#lender_points').attr('value', 3).change().blur();
   $('#refinance_points').attr('value', 0).change().blur().attr('disabled', true);
   $('#lender_rate').attr('value', 12).change().blur();
   $('#refinance_rate').attr('value', 12).change().blur().attr('disabled', true);
   $('#hold_time').attr('value', 0).change().blur().attr('disabled', true);
   $('#refinance_percentage').attr('value', 0).change().blur().attr('disabled', true);
   $('#closing_costs').attr('value', 800).change().blur();
   $('#my_cash').attr('value', 0).change().blur();
   $('#partner_split').attr('value', 0).change().blur().attr('disabled', true);
   $('#value_appreciation').attr('value', 3).change().blur();
   $('#rent_appreciation').attr('value', 3).change().blur();
   $('#expenses_appreciation').attr('value', 2).change().blur();
   $('#partner_cash').attr('value', getValue('purchase_price') - getValue('upg_down_payment')).change().blur().attr('disabled', true).prev().html('Owner Carry: ');
   
   $('#purchase_price').change(function() {
      $('#partner_cash').attr('value', getValue('purchase_price') - getValue('upg_down_payment')).change().blur();
   });
   
   $('#upg_down_payment').change(function() {
      $('#partner_cash').attr('value', getValue('purchase_price') - getValue('upg_down_payment')).change().blur();
   });
   
   $('#lender_rate').change(function() {
      $('#refinance_rate').attr('value', getValue('lender_rate')).change().blur();
   });
   
   $('#refinance_percentage').change().blur();
   
   optimize();
}

function prepILC() {
   $('#rental_rate').attr('disabled', true);
   $('#maintenance').attr('disabled', true);
   $('#vacancy').attr('disabled', true);
   $('#monthly_expenses').attr('disabled', true);
   $('#value_appreciation').attr('disabled', true);
   $('#rent_appreciation').attr('disabled', true);
   $('#expenses_appreciation').attr('disabled', true);
   
   $('input#arv').change(function() {
      setTimeout(function() {
         $('#rental_rate').attr('value', Math.floor(payment(7.5, 360, getValue('arv') * 1.08 * 0.92))).change().blur();
      }, 1);
   });
}

function optimize() {
   if ($('#isBFR').is(':checked')) {
      setBuyToMaxes();
      console.log('BFR Optimized');
      return true;
   }
   
   if ($('#isOC').is(':checked')) {
      setCarryToMaxes();
      console.log('OC Optimized');
      return true;
   }
   
   if ($('#isWS').is(':checked')) {
      setWholesaleToMaxes();
      console.log('WS Optimized');
      return true;
   } 
   
   if ($('#isUPG').is(':checked')) {
      setUPGToMaxes();
      console.log('UPG Optimized');
      return true;
   }
}

function setBuyToMaxes() {
   if ($('#mt_partner_cf span').eq(1).html().substring(1).replace(',', '') <= 0) {
      alert('Cashflow is negative. Cannot automatically optimize');
      return false;
   }
   
   $('#partner_cash').attr('value', floorTo500(getContent('mt_partner_cf span.label-inverse') * (100 / getValue("bfr_coc_target")))).blur().change()
   $('#purchase_price').attr('value', getValue('purchase_price') - ((Math.ceil(getContent('mt_refi_cashout') * 0.001) * 1000))).blur().change()
   $('#purchase_price').attr('value', floorTo500(getValue('purchase_price') + getContent('mt_refi_cashout') * (1 / (1 + (getContent('mt_effective_lender_rate') / 100))))).blur().change();
   
   return true;
}

function setCarryToMaxes() {
   my_min = Math.ceil(getValue('my_cash') * getValue('oc_min_coc') / 1200);
   $('#oc_mon_payment').attr('value', getContent('mt_noi span') - my_min).change().blur();
   bal_app = (getValue('oc_balloon_year') > 3) ? Math.pow((1 + (getValue('value_appreciation') / 100)), getValue('oc_balloon_year') - 3) : 1;
   max_balloon = getContent('mt_oc_balloon_val') * 0.75
   tot_payments = getValue('oc_mon_payment') * 12 * getValue('oc_balloon_year');
   $('#purchase_price').attr('value', max_balloon + tot_payments + getContent('mt_oc_down')).change().blur();
}

function setWholesaleToMaxes() {
   if ($('#mt_partner_cf span').eq(1).html().substring(1).replace(',', '') <= 0) {
      alert('Cashflow is negative. Cannot automatically optimize');
      return false;
   }
   
   $('#partner_cash').attr('value', floorTo500(getContent('mt_partner_cf span.label-inverse') * (100 / getValue("ws_coc_target")))).blur().change()
   
   // $('#purchase_price').attr('value', getValue('purchase_price') + floorTo500(getContent('mt_refi_cashout'))).blur().change();
   
   $('#purchase_price').attr('value', getValue('purchase_price') + getContent('mt_refi_cashout') * (1 / (1 + (getContent('mt_effective_lender_rate') / 100)))).blur().change();
   
   return true;
}

function setUPGToMaxes() {
   $('#upg_mon_payment').attr('value', getContent('mt_noi span') - (getValue('upg_mon_ncf') + getContent('mt_payment span'))).change().blur();
   bal_app = (getValue('upg_balloon_year') > 3) ? Math.pow((1 + (getValue('value_appreciation') / 100)), getValue('upg_balloon_year') - 3) : 1;
   max_balloon = (getContent('mt_oc_balloon_val') * 0.75) - getValue('upg_down_payment');
   tot_payments = getValue('upg_mon_payment') * 12 * getValue('upg_balloon_year');
   $('#purchase_price').attr('value', max_balloon + tot_payments + getContent('mt_oc_down')).change().blur();   
}

function createOffer() {
   if ($('#offer').attr('value') > 0) {
      w = window.open("create_offer.php?oid=" + $('#offer').attr('value'), "_blank", "height=600,width=917,alwaysRaised=yes,scrollbars=yes");
   } else {
      $('#offerGen').html('<b>Please provide the following information to create an offer:</b><br><br>County: <input type="text" size="10" id="county" placeholder="e.g. Arapahoe"><br>Legal Description:<br><input type="text" size="30" placeholder="Line 1" id="ld1" style="margin-bottom: 0px;"><br><input type="text" size="30" placeholder="Line 2" id="ld2" style="margin-bottom: 5px;"><br><br>Buyer Entity: <input type="text" size="15" placeholder="e.g. SQ Enterprises, LLC" id="buyer"><br><input type="button" class="btn" value="Create" onClick="submitOffer()">').dialog({
         resizable: false,
         height: 300,
         width: 500,
         draggable: true,
         modal: true
      });
   }
}

function submitOffer() {
   w = window.open('create_offer.php?pid=' + $('#id').attr('value') + '&sid=' + $('#source').attr('value') + '&county=' + $('#county').attr('value') + '&ld1=' + $('#ld1').attr('value') + '&ld2=' + $('#ld2').attr('value') + '&buyer=' + $('#buyer').attr('value'), "_blank", "height=600,width=917,alwaysRaised=yes,scrollbars=yes");
   $('#offerGen').dialog('close');
}

function toggleOfferButton() {
   if (getValue('purchase_price') == 0) {
      $('#offerBtn').addClass('disabled');
   } else {
      $('#offerBtn').removeClass('disabled');
   }
}

function reInit() {
   
   $('section input[type="text"]:disabled').removeAttr('disabled');
   $('span[id$="exit"]').hide()
   
   $('#partner_cash').prev().html('Partner Cash: ');
   $('#mt_upg_mon_payment').parents('div').eq(0).hide().prev().prev().html('Payment:');
   
   $('input').unbind('change');
   $('input').unbind('blur');
   
   auction_onLoad();
}

function auction_onLoad() {
   $("section input").css("margin-top", "1px").css("margin-bottom", "1px").css("padding-top", "0px").css("padding-bottom", "0px");
   $("input.dollar").blur(function() {
      $(this).attr('value', '$' + addCommas($(this).attr('value').replace(/\D/g,'')));
   }).focus(function() {
      $(this).attr('value', $(this).attr('value').replace(/\D/g,''));
   }).each(function() {
      $(this).attr('value', '$' + addCommas($(this).attr('value').replace(/\D/g,'')));
   });
   
   $("input.percent").blur(function() {
      if ($(this).attr('value').indexOf('%') < 0) {
         $(this).attr('value', addCommas($(this).attr('value')) + '%');
      }
   }).focus(function() {
      if ($(this).attr('value').indexOf('%') > 0) {
         $(this).attr('value', $(this).attr('value').substring(0, $(this).attr('value').length - 1));
      }
   }).each(function() {
      if ($(this).attr('value').indexOf('%') < 0) {
         $(this).attr('value', addCommas($(this).attr('value')) + '%');
      }
   });
   
   $("input").change(function() {
      if ($('#savedBadge').html() == 'Saved') {
         $('#savedBadge').removeClass('badge-success').addClass('badge-warning').html('Not Saved');
         $('#submit').attr('onClick', 'saveScenario(); toggleOfferButton();').html('Save');
      }

      $(this).css('border-color', '#C09853');
   }).blur(function() {
      calculateScenario();
   }).keypress(function(e) {
      if (e.which == 13) {
         $(this).blur();
      }
   });
   
   $('#dialog').hide();
   if ($('#isILC').attr('checked')) {
      prepILC();
      $('#dialog').dialog('close');
   }
   
   $('div.section_header span dd div').css({'width': '125px'})
}

function printThis() {
   $('div.span3').hide()
   $('div.navbar').hide()
   $('div.options_cont').hide();
   $('input#print').hide();
   $('body').css({'background': 'none'})
   window.print();
   $('div.span3').show()
   $('div.navbar').show()
   $('div.options_cont').show();
   $('input#print').show();
}






















