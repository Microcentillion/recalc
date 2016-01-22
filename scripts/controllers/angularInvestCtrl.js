angular
   .module('app')
   .controller('angularInvestCtrl', ['$scope', function($scope) {
      $scope.method = 'trad';

      $scope.balloon_year  = 6;
      $scope.partner_coc_target = 14;
      $scope.refi_cash_out = false;
      $scope.oc_mon_payment = 700;
      $scope.my_coc_target = 16;

      $scope.arv           = 415000;
      $scope.taxes         = 2400;
      $scope.rental_rate   = 3265;
      $scope.insurance     = 1000;

      $scope.lender_rate   = 12;
      $scope.lender_points = 3;
      $scope.hold_time     = 6;

      $scope.mortgage_insurance = 0.85;
      $scope.mortgage_insurance_ltv = 75;

      $scope.refinance_rate = 3.875;
      $scope.refinance_points = 1.7;
      $scope.refinance_percentage = 96.5;

      $scope.maintenance = 5;
      $scope.management = 7;
      $scope.repairs = 5;
      $scope.vacancy = 5;
      $scope.monthly_expenses = 120;

      $scope.value_appreciation = 3;
      $scope.rent_appreciation = 3;
      $scope.expenses_appreciation = 2;

      $scope.closing_costs = 800;
      $scope.purchase_price = 445000;
      $scope.imm_repairs = 0;
      $scope.acquisition_fee = 3000;
      $scope.my_cash = 22500;
      $scope.partner_cash = 0;
      $scope.partner_split = 0;

      $scope.floorTo500 = function(number) {
         number *= 0.001;
         rounded = Math.round(number);
         newNumber = ((rounded >= number) ? ((rounded - 0.5) * 1000) : (rounded * 1000));
         return (newNumber == (number * 1000)) ? newNumber - 500 : newNumber;
      }

      $scope.getEffectiveRate = function(rate) {
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

      $scope.eval_payment = function(b, n, a) {
         var r = b/(12*100);
         var p = (a * r *Math.pow((1+r),n))/(Math.pow((1+r),n)-1);
         var prin = Math.ceil(p);
         return prin;
      }

      $scope.eval_balance = function(rate, num, value, period) {
         var r = rate/(12*100);
         
         remaining = (value * Math.pow(1 + r, period)) - ($scope.eval_payment(rate, num, value) * ((Math.pow(1 + r, period) - 1) / r))
         return Math.ceil(remaining);
      }

      $scope.colorize = function(e, state) {
         if (state) {
            e.addClass('label-success').removeClass('label-important');
         } else {
            e.addClass('label-important').removeClass('label-success');
         }
      }

      $scope.changeMethod = function() {
         $scope.prepareReset();
         
         switch ($scope.method) {
            case "trad":
               $scope.prepareTraditional();
            break;

            case "bfr":
               $scope.prepareBuyfixrent();
            break;

            case "oc":
               $scope.prepareOwnercarry();
            break;

            case "ws":
               $scope.prepareWholesale();
            break;

            case "upg":
               $scope.prepareUltimateprofitgenerator();
            break;
         }

         $scope.calculate();
      }

      $scope.calculate = function() {
         switch ($scope.method) {
            case "trad":
               $scope.calculateTraditional();
            break;

            case "bfr":
               $scope.calculateBuyfixrent();
            break;

            case "oc":
               $scope.calculateOwnercarry();
            break;

            case "ws":
               $scope.calculateWholesale();
            break;

            case "upg":
               $scope.calculateUltimateprofitgenerator();
            break;
         }

         $scope.updateGrade();
      }

      $scope.updateGrade = function() {
         $('#grade').removeClass('badge-important').removeClass('badge-warning').removeClass('badge-success');
         if ($('.label-important').length == 0) {
            $('#grade').addClass('badge-success').html('Status: GOOD');
         } else if ($('.label-important').length == 1) {
            $('#grade').addClass('badge-warning').html('Status: WARN');
         } else {
            $('#grade').addClass('badge-important').html('Status: BAD');
         }
      }

      $scope.optimize = function() {
         switch ($scope.method) {
            case "trad":
               for (g = 1; g <= 10; g++) {
                  $scope.optimizeTraditional();
               }
            break;

            case "bfr":
               for (g = 1; g <= 10; g++) {
                  $scope.optimizeBuyfixrent();
               }
            break;

            case "oc":
               $scope.optimizeOwnercarry();
            break;

            case "ws":
               $scope.optimizeWholesale();
            break;

            case "upg":
               $scope.optimizeUltimateprofitgenerator();
            break;
         }
      }

      // View preparations
      $scope.prepareReset = function() {
         $('#p1_ltv').removeClass('label').removeClass('label-success').removeClass('label-important');
         $('#piti_rent').removeClass('label').removeClass('label-success').removeClass('label-important');
         $('#oc_down').removeClass('label').removeClass('label-success').removeClass('label-important');
         $('#refi_cashout').removeClass('label').removeClass('label-success').removeClass('label-important');
         $('input#[ng-model="lender_rate"]').removeAttr('disabled');
         $('input#[ng-model="lender_points"]').removeAttr('disabled');
         $('input#[ng-model="hold_time"]').removeAttr('disabled');
         $('input#[ng-model="acquisition_fee"]').removeAttr('disabled');
         $('input#[ng-model="partner_split"]').removeAttr('disabled');
         $('input#[ng-model="refinance_points"]').removeAttr('disabled');
         $('input#[ng-model="refinance_rate"]').removeAttr('disabled');
         $('input#[ng-model="refinance_percentage"]').removeAttr('disabled');


         $('input[ng-model="partner_cash"]').prev().html('Partner Cash: ');
      }

      $scope.prepareTraditional = function() {
         $scope.prepareReset();

         $('#p1_ltv').addClass('label');
         $('#piti_rent').addClass('label');
         $('input#[ng-model="lender_rate"]').attr('disabled', true);
         $('input#[ng-model="lender_points"]').attr('disabled', true);
         $('input#[ng-model="hold_time"]').attr('disabled', true);
         $('input#[ng-model="acquisition_fee"]').attr('disabled', true);

         $scope.calculateTraditional();
      }

      $scope.prepareBuyfixrent = function() {
         $scope.prepareReset();

         $('#refi_cashout').addClass('label');

         $scope.calculateBuyfixrent();
      }

      $scope.prepareOwnercarry = function() {
         $scope.prepareReset();

         $('#oc_down').addClass('label');
         $('input#[ng-model="lender_rate"]').attr('disabled', true);
         $('input#[ng-model="lender_points"]').attr('disabled', true);
         $('input#[ng-model="hold_time"]').attr('disabled', true);
         $('input#[ng-model="acquisition_fee"]').attr('disabled', true);
         $('input#[ng-model="refinance_points"]').attr('disabled', true);
         $('input#[ng-model="refinance_rate"]').attr('disabled', true);
         $('input#[ng-model="partner_split"]').attr('disabled', true);

         $('input[ng-model="partner_cash"]').prev().html('Owner Carry: ');

         $scope.calculateOwnercarry();
      }

      $scope.prepareWholesale = function() {
         $scope.prepareReset();

         $scope.calculateWholesale();
      }

      $scope.prepareUltimateprofitgenerator = function() {
         $scope.prepareReset();

         $scope.calculateUltimateprofitgenerator();
      }

      // Calculators
      $scope.calculateTraditional = function() {
         $scope.rental_rate_year = $scope.rental_rate * 12;

         $scope.mt_repairs       = $scope.repairs * $scope.rental_rate / 100;
         $scope.mt_repairs_year  = $scope.mt_repairs * 12;

         $scope.mt_maintenance   = $scope.maintenance * $scope.rental_rate / 100;
         $scope.mt_maintenance_year = $scope.mt_maintenance * 12;

         $scope.mt_management   = $scope.management * $scope.rental_rate / 100;
         $scope.mt_management_year = $scope.mt_management * 12;

         $scope.mt_vacancy       = $scope.vacancy * $scope.rental_rate / 100;
         $scope.mt_vacancy_year  = $scope.mt_vacancy * 12;

         $scope.insurance_month   = Math.round($scope.insurance / 12);
         
         $scope.taxes_month      =  Math.round($scope.taxes / 12);
         $scope.monthly_expenses_year = $scope.monthly_expenses * 12;

         $scope.total_expenses = Number($scope.mt_maintenance) + Number($scope.mt_management) + Number($scope.mt_vacancy) + Number($scope.taxes_month) + Number($scope.monthly_expenses) + Number($scope.mt_repairs) + Number($scope.insurance_month);
         $scope.total_expenses_year = Number($scope.mt_maintenance_year) + Number($scope.mt_management_year) + Number($scope.mt_vacancy_year) + Number($scope.taxes) + Number($scope.monthly_expenses_year) + Number($scope.mt_repairs_year) + Number($scope.insurance);

         $scope.noi = $scope.rental_rate - $scope.total_expenses;
         $scope.noi_year = $scope.rental_rate_year - $scope.total_expenses_year;

         $scope.cap_rate = ($scope.noi_year / $scope.purchase_price * 100).toFixed(2);

         $scope.total_cost_to_buy = Number($scope.purchase_price) + Number($scope.imm_repairs) + Number($scope.acquisition_fee) + Number($scope.closing_costs);
         $scope.cash_available = Number($scope.my_cash) + Number($scope.partner_cash);
         $scope.cash_needed = $scope.total_cost_to_buy - $scope.cash_available;

         $scope.acquisition_fee = 0;
         $scope.lender_points = 0;
         $scope.lender_rate = 0;
         $scope.hold_time = 0;
         $scope.effective_lender_rate = 0;
         $scope.lender_costs = 0;

         $scope.refinance_costs = $scope.cash_needed * $scope.refinance_points / 100;

         $scope.total_to_borrow = $scope.cash_needed + $scope.refinance_costs;

         $scope.payment = $scope.eval_payment($scope.refinance_rate, 360, $scope.total_to_borrow);
         $scope.payment_year = $scope.payment * 12;

         $scope.p1_ltv = ($scope.total_to_borrow / $scope.arv * 100).toFixed(2);
         $scope.p1_profit_taking = $scope.acquisition_fee;

         $scope.mortgage_insurance_amount_year = ($scope.p1_ltv > $scope.mortgage_insurance_ltv) ? Math.ceil($scope.mortgage_insurance * $scope.total_to_borrow / 100) : 0;
         $scope.mortgage_insurance_amount = $scope.mortgage_insurance_amount_year / 12;

         $scope.pitim = Number($scope.payment) + Number($scope.taxes_month) + Number($scope.insurance_month) + Number($scope.mortgage_insurance_amount)
         $scope.piti_rent = ($scope.pitim / $scope.rental_rate * 100).toFixed(2);

         $scope.ncf = $scope.noi - $scope.payment - $scope.mortgage_insurance_amount;
         $scope.ncf_year = $scope.ncf * 12;

         $scope.partner_cf = $scope.partner_split * $scope.ncf / 100;
         $scope.partner_cf_year = $scope.partner_cf * 12;
         $scope.partner_coc = ($scope.partner_cash > 0) ? ($scope.partner_cf_year / $scope.partner_cash * 100).toFixed(2) : 0;

         $scope.my_cf = $scope.ncf - $scope.partner_cf;
         $scope.my_cf_year = $scope.ncf_year - $scope.partner_cf_year;
         $scope.my_coc = ($scope.my_cash > 0) ? ($scope.my_cf_year / $scope.my_cash * 100).toFixed(2) : "∞";
         $scope.total_to_seller = $scope.purchase_price;

         $scope.imm_equity = $scope.arv - $scope.total_cost_to_buy;
         $scope.p1_profit = 0 - $scope.my_cash;

         $scope.balloon_val = Math.round($scope.arv * (Math.pow(1 + ($scope.value_appreciation / 100), $scope.balloon_year)));
         $scope.balloon = $scope.eval_balance($scope.refinance_rate, 360, $scope.total_to_borrow, $scope.balloon_year * 12)
         $scope.btv     = ($scope.balloon / $scope.balloon_val * 100).toFixed(2);

         $scope.years = Array();
         cumcf = 0;
         for (a = 0; a <= 9; a++) {
            eyear = (a > 2) ? a - 2 : 0;
            $scope.years[a] = Array();
            $scope.years[a].year = a + 1;
            $scope.years[a].miclass = 'mi-none';
            $scope.years[a].bgcolor = (a % 2 == 1) ? '#c0c0c0' : '#ffffff';
            $scope.years[a].rents = Math.round($scope.rental_rate_year * Math.pow(1 + ($scope.rent_appreciation / 100), eyear));
            narv = Math.round($scope.arv * Math.pow(1 + ($scope.value_appreciation / 100), eyear));
            nbal = $scope.eval_balance($scope.refinance_rate, 360, $scope.total_to_borrow, (a + 1) * 12);
            $scope.years[a].equity = narv - nbal - ($scope.arv - $scope.total_to_borrow);
            $scope.years[a].partner_profit = ($scope.partner_cash > 0) ? Number($scope.years[a].cumcf * $scope.partner_split / 100) + Number($scope.years[a].equity * $scope.partner_split / 100) : 0;
            $scope.years[a].partner_coc = ($scope.partner_cash > 0) ? (($scope.years[a].cf * $scope.partner_split) / $scope.partner_cash).toFixed(2) : 0;
            $scope.years[a].partner_roi = ($scope.partner_cash > 0) ? (($scope.years[a].partner_profit / $scope.years[a].year) / $scope.partner_cash * 100).toFixed(2) : 0;

            $scope.years[a].expenses = Math.round(($scope.total_expenses_year * (Math.pow(1 + ($scope.expenses_appreciation / 100), eyear))) + $scope.payment_year);

            if (nbal > narv * $scope.mortgage_insurance_ltv / 100) {
               $scope.years[a].expenses += $scope.mortgage_insurance_amount_year;
               $scope.years[a].miclass = 'mi-active';
            }

            $scope.years[a].cf = $scope.years[a].rents - $scope.years[a].expenses;
            cumcf += Number($scope.years[a].cf);
            $scope.years[a].cumcf = cumcf;
         }

         $scope.y10_equity = $scope.years[9].equity;
         $scope.y10_cf = $scope.years[9].cumcf;
         $scope.y10_profit = Number($scope.y10_equity) + Number($scope.y10_cf);

         // Evaluation Phase:
         $scope.colorize($('#p1_ltv'), ($scope.p1_ltv <= $scope.refinance_percentage));
         $scope.colorize($('#partner_coc'), ($scope.partner_coc >= $scope.partner_coc_target || $scope.partner_cash == 0));
         $scope.colorize($('#my_coc'), ($scope.my_coc >= 14));
         $scope.colorize($('#piti_rent'), ($scope.piti_rent <= 75));
      }

      $scope.calculateBuyfixrent = function() {
         $scope.rental_rate_year = $scope.rental_rate * 12;

         $scope.mt_repairs       = $scope.repairs * $scope.rental_rate / 100;
         $scope.mt_repairs_year  = $scope.mt_repairs * 12;

         $scope.mt_maintenance   = $scope.maintenance * $scope.rental_rate / 100;
         $scope.mt_maintenance_year = $scope.mt_maintenance * 12;

         $scope.mt_management   = $scope.management * $scope.rental_rate / 100;
         $scope.mt_management_year = $scope.mt_management * 12;

         $scope.mt_vacancy       = $scope.vacancy * $scope.rental_rate / 100;
         $scope.mt_vacancy_year  = $scope.mt_vacancy * 12;
         
         $scope.taxes_month      =  Math.round($scope.taxes / 12);
         $scope.monthly_expenses_year = $scope.monthly_expenses * 12;

         $scope.total_cost_to_buy = Number($scope.purchase_price) + Number($scope.imm_repairs) + Number($scope.acquisition_fee) + Number($scope.closing_costs);
         $scope.cash_available = Number($scope.my_cash) + Number($scope.partner_cash);
         $scope.cash_needed = $scope.total_cost_to_buy - $scope.cash_available;

         $scope.effective_lender_rate = $scope.getEffectiveRate(($scope.lender_rate / 12 * $scope.hold_time) + Number($scope.lender_points));
         $scope.lender_costs = $scope.cash_needed * $scope.effective_lender_rate / 100;

         // $scope.refinance_costs = $scope.refi_amount * $scope.refinance_points / 100;

         $scope.total_to_borrow = Number($scope.cash_needed) + Number($scope.lender_costs);

         $scope.total_expenses = Number($scope.mt_maintenance) + Number($scope.mt_management) + Number($scope.mt_vacancy) + Number($scope.taxes_month) + Number($scope.monthly_expenses) + Number($scope.mt_repairs);
         $scope.total_expenses_year = Number($scope.mt_maintenance_year) + Number($scope.mt_management_year) + Number($scope.mt_vacancy_year) + Number($scope.taxes) + Number($scope.monthly_expenses_year) + Number($scope.mt_repairs_year);

         $scope.noi = $scope.rental_rate - $scope.total_expenses;
         $scope.noi_year = $scope.rental_rate_year - $scope.total_expenses_year;

         $scope.cap_rate = ($scope.noi_year / ($scope.total_to_borrow + $scope.cash_available) * 100).toFixed(2);

         $scope.payment = $scope.eval_payment($scope.refinance_rate, 360, $scope.total_to_borrow);
         $scope.payment_year = $scope.payment * 12;

         $scope.ncf = $scope.noi - $scope.payment;
         $scope.ncf_year = $scope.ncf * 12;

         if ($scope.refi_cash_out) {
            $scope.refi_amount = Math.round(($scope.refinance_percentage - $scope.refinance_points) * $scope.arv / 100);
            $scope.refi_points_dollars = ($scope.refinance_points * $scope.refi_amount / 100).toFixed(2);
            //$scope.refi_amount += Number($scope.refi_points_dollars);
            $scope.refi_cashout = $scope.refi_amount - $scope.total_to_borrow - $scope.refi_points_dollars;
         } else {
            $scope.refi_amount = Number($scope.total_to_borrow);
            $scope.refi_points_dollars = ($scope.refinance_points * $scope.refi_amount / 100).toFixed(2);
            $scope.refi_amount += Number($scope.refi_points_dollars);
            $scope.refi_cashout = $scope.refi_amount - $scope.total_to_borrow - $scope.refi_points_dollars;
         }

         $scope.p1_profit_taking = $scope.acquisition_fee;
         $scope.p1_ltv = ($scope.refi_amount / $scope.arv * 100).toFixed(2);

         $scope.partner_cf = $scope.partner_split * $scope.ncf / 100;
         $scope.partner_cf_year = $scope.partner_cf * 12;
         $scope.partner_coc = ($scope.partner_cash > 0) ? ($scope.partner_cf_year / $scope.partner_cash * 100).toFixed(2) : 0;

         $scope.my_cf = $scope.ncf - $scope.partner_cf;
         $scope.my_cf_year = $scope.ncf_year - $scope.partner_cf_year;
         $scope.my_coc = ($scope.my_cash > 0) ? ($scope.my_cf_year / $scope.my_cash * 100).toFixed(2) : "∞";
         $scope.total_to_seller = $scope.purchase_price;

         $scope.imm_equity = $scope.arv - $scope.total_cost_to_buy;
         $scope.p1_profit = ($scope.refi_cash_out) ? $scope.refi_cashout : 0;
         $scope.p1_profit = ($scope.refi_cashout < 0) ? $scope.refi_cashout : $scope.p1_profit;

         $scope.balloon_val = Math.round($scope.arv * (Math.pow(1 + ($scope.value_appreciation / 100), $scope.balloon_year)));
         $scope.balloon = $scope.eval_balance($scope.refinance_rate, 360, $scope.total_to_borrow, $scope.balloon_year * 12)
         $scope.btv     = ($scope.balloon / $scope.balloon_val).toFixed(2);

         $scope.years = Array();
         cumcf = 0;
         for (a = 0; a <= 9; a++) {
            eyear = (a > 2) ? a - 2 : 0;
            $scope.years[a] = Array();
            $scope.years[a].year = a + 1;
            $scope.years[a].bgcolor = (a % 2 == 1) ? '#c0c0c0' : '#ffffff';
            $scope.years[a].rents = Math.round($scope.rental_rate_year * Math.pow(1 + ($scope.rent_appreciation / 100), eyear));
            $scope.years[a].expenses = Math.round(($scope.total_expenses_year * (Math.pow(1 + ($scope.expenses_appreciation / 100), eyear))) + $scope.payment_year);
            $scope.years[a].cf = $scope.years[a].rents - $scope.years[a].expenses;
            cumcf += Number($scope.years[a].cf);
            $scope.years[a].cumcf = cumcf;
            $scope.years[a].equity = Math.round(($scope.arv * (Math.pow(1 + ($scope.value_appreciation / 100), eyear))) - $scope.eval_balance($scope.refinance_rate, 360, $scope.total_to_borrow, (a + 1) * 12) - ($scope.arv - $scope.total_to_borrow));
            $scope.years[a].partner_profit = Number($scope.years[a].cumcf * $scope.partner_split / 100) + Number($scope.years[a].equity * $scope.partner_split / 100);
            $scope.years[a].partner_coc = (($scope.years[a].cf * $scope.partner_split) / $scope.partner_cash).toFixed(2);
            $scope.years[a].partner_roi = (($scope.years[a].partner_profit / $scope.years[a].year) / $scope.partner_cash * 100).toFixed(2);
         }

         $scope.y10_equity = $scope.years[9].equity;
         $scope.y10_cf = $scope.years[9].cumcf;
         $scope.y10_profit = Number($scope.y10_equity) + Number($scope.y10_cf);

         // Evaluation Phase:
         $scope.colorize($('#refi_cashout'), ($scope.refi_cashout > -1));
         $scope.colorize($('#partner_coc'), ($scope.partner_coc > $scope.partner_coc_target || $scope.partner_cash == 0));
      }

      $scope.calculateOwnercarry = function() {
         $scope.acquisition_fee = 0;
         $scope.refinance_points = 0;
         $scope.partner_split = 0;

         $scope.rental_rate_year = $scope.rental_rate * 12;

         $scope.mt_repairs       = $scope.repairs * $scope.rental_rate / 100;
         $scope.mt_repairs_year  = $scope.mt_repairs * 12;

         $scope.mt_maintenance   = $scope.maintenance * $scope.rental_rate / 100;
         $scope.mt_maintenance_year = $scope.mt_maintenance * 12;

         $scope.mt_management   = $scope.management * $scope.rental_rate / 100;
         $scope.mt_management_year = $scope.mt_management * 12;

         $scope.mt_vacancy       = $scope.vacancy * $scope.rental_rate / 100;
         $scope.mt_vacancy_year  = $scope.mt_vacancy * 12;
         
         $scope.taxes_month      =  Math.round($scope.taxes / 12);
         $scope.monthly_expenses_year = $scope.monthly_expenses * 12;

         $scope.acquisition_expenses = Number($scope.imm_repairs) + Number($scope.acquisition_fee) + Number($scope.closing_costs);

         $scope.total_cost_to_buy = Number($scope.purchase_price) + $scope.acquisition_expenses;
         $scope.cash_available = Number($scope.my_cash);
         $scope.cash_needed = $scope.total_cost_to_buy - $scope.cash_available;

         $scope.refinance_costs = $scope.refi_amount * $scope.refinance_points / 100;

         $scope.total_to_borrow = Number($scope.cash_needed);

         $scope.total_expenses = Number($scope.mt_maintenance) + Number($scope.mt_management) + Number($scope.mt_vacancy) + Number($scope.taxes_month) + Number($scope.monthly_expenses) + Number($scope.mt_repairs);
         $scope.total_expenses_year = Number($scope.mt_maintenance_year) + Number($scope.mt_management_year) + Number($scope.mt_vacancy_year) + Number($scope.taxes) + Number($scope.monthly_expenses_year) + Number($scope.mt_repairs_year);

         $scope.noi = $scope.rental_rate - $scope.total_expenses;
         $scope.noi_year = $scope.rental_rate_year - $scope.total_expenses_year;

         $scope.cap_rate = ($scope.noi_year / ($scope.total_to_borrow + $scope.cash_available) * 100).toFixed(2);

         $scope.payment = $scope.oc_mon_payment;
         $scope.payment_year = $scope.payment * 12;

         $scope.ncf = $scope.noi - $scope.payment;
         $scope.ncf_year = $scope.ncf * 12;

         if ($scope.refi_cash_out) {
            $scope.refi_amount = Math.round(($scope.refinance_percentage - $scope.refinance_points) * $scope.arv / 100);
            $scope.refi_points_dollars = ($scope.refinance_points * $scope.refi_amount / 100).toFixed(2);
            //$scope.refi_amount += Number($scope.refi_points_dollars);
            $scope.refi_cashout = $scope.refi_amount - $scope.total_to_borrow - $scope.refi_points_dollars;
         } else {
            $scope.refi_amount = Number($scope.total_to_borrow);
            $scope.refi_points_dollars = ($scope.refinance_points * $scope.refi_amount / 100).toFixed(2);
            $scope.refi_amount += Number($scope.refi_points_dollars);
            $scope.refi_cashout = $scope.refi_amount - $scope.total_to_borrow - $scope.refi_points_dollars;
         }

         $scope.p1_profit_taking = $scope.acquisition_fee;
         $scope.p1_ltv = ($scope.refi_amount / $scope.arv * 100).toFixed(2);

         $scope.partner_cf = $scope.oc_mon_payment
         $scope.partner_cf_year = $scope.partner_cf * 12;
         $scope.partner_coc = ($scope.partner_cash > 0) ? ($scope.partner_cf_year / $scope.partner_cash * 100).toFixed(2) : 0;

         $scope.my_cf = $scope.ncf;
         $scope.my_cf_year = $scope.ncf_year;
         $scope.my_coc = ($scope.my_cash > 0) ? ($scope.my_cf_year / $scope.my_cash * 100).toFixed(2) : "∞";

         $scope.oc_down = $scope.my_cash - $scope.acquisition_expenses - $scope.refi_points_dollars;
         $scope.oc_down_percentage = ($scope.oc_down / $scope.purchase_price * 100).toFixed(2);

         $scope.oc_cf = $scope.oc_mon_payment * 12 * $scope.balloon_year;

         $scope.imm_equity = $scope.arv - $scope.total_cost_to_buy;
         $scope.p1_profit = ($scope.refi_cash_out) ? $scope.refi_cashout : 0;
         $scope.p1_profit = ($scope.refi_cashout < 0) ? $scope.refi_cashout : $scope.p1_profit;

         $scope.balloon_val = Math.round($scope.arv * (Math.pow(1 + ($scope.value_appreciation / 100), $scope.balloon_year)));
         $scope.balloon = $scope.purchase_price - $scope.oc_down - $scope.oc_cf;
         $scope.btv     = ($scope.balloon / $scope.balloon_val).toFixed(2);

         $scope.total_to_seller = Number($scope.oc_cf) + Number($scope.balloon) + Number($scope.oc_down);

         $scope.years = Array();
         cumcf = 0;
         for (a = 0; a <= 9; a++) {
            eyear = (a > 2) ? a - 2 : 0;
            $scope.years[a] = Array();
            $scope.years[a].year = a + 1;
            $scope.years[a].bgcolor = (a % 2 == 1) ? '#c0c0c0' : '#ffffff';
            $scope.years[a].rents = Math.round($scope.rental_rate_year * Math.pow(1 + ($scope.rent_appreciation / 100), eyear));
            $scope.years[a].expenses = Math.round(($scope.total_expenses_year * (Math.pow(1 + ($scope.expenses_appreciation / 100), eyear))) + $scope.payment_year);
            $scope.years[a].cf = $scope.years[a].rents - $scope.years[a].expenses;
            cumcf += Number($scope.years[a].cf);
            $scope.years[a].cumcf = cumcf;
            $scope.years[a].equity = Math.round(($scope.arv * (Math.pow(1 + ($scope.value_appreciation / 100), eyear))) - $scope.eval_balance($scope.refinance_rate, 360, $scope.total_to_borrow, (a + 1) * 12) - ($scope.arv - $scope.total_to_borrow));
            $scope.years[a].partner_profit = Number($scope.years[a].cumcf * $scope.partner_split / 100) + Number($scope.years[a].equity * $scope.partner_split / 100);
            $scope.years[a].partner_coc = (($scope.years[a].cf * $scope.partner_split) / $scope.partner_cash).toFixed(2);
            $scope.years[a].partner_roi = (($scope.years[a].partner_profit / $scope.years[a].year) / $scope.partner_cash * 100).toFixed(2);
         }

         $scope.y10_equity = $scope.years[9].equity;
         $scope.y10_cf = $scope.years[9].cumcf;
         $scope.y10_profit = Number($scope.y10_equity) + Number($scope.y10_cf);

         // Evaluation Phase:
         $scope.colorize($('#refi_cashout'), ($scope.refi_cashout > -1));
         $scope.colorize($('#my_coc'), ($scope.my_coc >= $scope.my_coc_target));
         $scope.colorize($('#oc_down'), ($scope.oc_down > 0));
      }

      $scope.calculateWholesale = function() {

      }

      $scope.calculateUltimateprofitgenerator = function() {

      }

      // Optimizations
      $scope.optimizeTraditional = function() {
         $scope.purchase_price = $scope.floorTo500(($scope.arv * $scope.refinance_percentage / 100) - (Number($scope.imm_repairs) + Number($scope.closing_costs) + Number($scope.refinance_costs)) + Number($scope.cash_available));

         $scope.partner_cash = ($scope.partner_split > 0 && $scope.partner_cash > 0) ? $scope.floorTo500((100 / $scope.partner_coc_target) * $scope.partner_cf_year) : 0;

         $scope.calculateTraditional();
      }

      $scope.optimizeBuyfixrent = function() {
         if ($scope.partner_cash > 0) {
            $scope.partner_cash = $scope.floorTo500((100 / $scope.partner_coc_target) * $scope.partner_cf_year);
         }

         imm_expenses = $scope.total_cost_to_buy - $scope.purchase_price;
         purchase_price = ($scope.arv * ($scope.refinance_percentage - $scope.refinance_points) / 100) * (1 / (1 + ($scope.effective_lender_rate / 100))) * (1 / (1 + ($scope.refinance_points / 100)));
         $scope.purchase_price = $scope.floorTo500(purchase_price) + Number($scope.partner_cash) - imm_expenses;

         $scope.calculateBuyfixrent();
      }

      $scope.optimizeOwnercarry = function() {
         if ($scope.my_cash < $scope.acquisition_expenses) {
            $scope.my_cash = $scope.acquisition_expenses;
         }

         $scope.purchase_price = $scope.floorTo500(Number($scope.oc_down) + Number($scope.oc_cf) + ($scope.balloon_val * $scope.refinance_percentage / 100));

         my_min_payment = ($scope.my_coc_target * $scope.my_cash / 100) / 12;
         $scope.oc_mon_payment = Math.floor($scope.noi - my_min_payment);

         $scope.calculateOwnercarry();
      }

      $scope.optimizeWholesale = function() {

         $scope.calculateWholesale();
      }

      $scope.optimizeUltimateprofitgenerator = function() {

         $scope.calculateUltimateprofitgenerator();
      }

      $scope.renderPrint = function() {
         $('#print').hide();
         $('div#inputs').hide();
         $('div#floater').hide();
         $('div#proforma').removeClass('span9').addClass('span12');
         $('div.navbar').hide();
         $('div.options_cont').hide();
         $('input#print').hide();
         $('h6').hide();
         $('body').css({'background': 'none', 'color': '#000000'})
         $('a#toTop').hide();
         window.print();
         $('#print').show();
         $('h6').show();
         $('div#inputs').show();
         $('div#floater').show()
         $('div#proforma').removeClass('span12').addClass('span9');
         $('div.navbar').show();
         $('div.options_cont').show();
         $('input#print').show();
         $('body').css({'background': '', 'color': '#737373'})
      }

      $('input').keypress(function(e) {
         if (e.which == 13) {
            $(this).blur();
         }
      });

      $scope.changeMethod();
      $scope.optimize();
   }]);
