angular
   .module('app')
   .controller('angularInvestCtrl', ['$scope', function($scope) {
      $scope.method = 'corp-hm';

      $scope.fmv                 = 165000;
      $scope.rental_rate         = 1450;
      $scope.operating_expenses  = 569;
      $scope.debt_service        = 789;
      $scope.mortgage_balance    = 106000;
      $scope.management          = false;

      $scope.seller_min_cashout  = 0;
      $scope.closing_costs       = 800;
      $scope.force_equity_compensation = true;

      $scope.gap_points          = 2;

      $scope.lender_points       = 3;
      $scope.lender_rate         = 12;
      $scope.hold_time           = 1;

      $scope.market_return       = 6;

      $scope.company_name        = "<unknown>";
      $scope.company_target      = 0.25;
      $scope.company_minimum_perc = 10;
      $scope.company_minimum_cash = 10000;
      $scope.cap_target          = 8;

      $scope.getEffectiveRate = function(number) {
         number = 1 - (number / 100);
         number = (1 / number) - 1;
         return number.toFixed(4);
      }

      $scope.getSharesFromDollars = function(dollars) {
         shareCost = (1 / (Number($scope.market_return) / 100)) * $scope.company_target * 12;

         result = Array();
         result['shares'] = Math.floor(dollars / shareCost);
         result['shares_value'] = result['shares'] * shareCost;
         result['cf_month'] = result['shares'] * $scope.company_target;
         result['cf_year'] = result['cf_month'] * 12;

         return result;
      }

      $scope.getSharesFromCashflow = function(cashflow) {
         shareCost = (1 / (Number($scope.market_return) / 100)) * $scope.company_target * 12;

         result = Array();
         result['shares'] = Math.floor(cashflow / $scope.company_target);
         result['shares_value'] = result['shares'] * shareCost;
         result['cf_month'] = result['shares'] * $scope.company_target;
         result['cf_year'] = result['cf_month'] * 12;

         return result;
      }

      $scope.floorTo500 = function(number) {
         number *= 0.001;
         rounded = Math.round(number);
         newNumber = ((rounded >= number) ? ((rounded - 0.5) * 1000) : (rounded * 1000));
         return (newNumber == (number * 1000)) ? newNumber - 500 : newNumber;
      }

      $scope.colorize = function(e, state) {
         if (state) {
            e.addClass('label-success').removeClass('label-important');
         } else {
            e.addClass('label-important').removeClass('label-success');
         }
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

      // Calculators
      $scope.calculate = function() {
         // Phase 1: Current Performance
         $scope.rental_rate_year = $scope.rental_rate * 12;
         $scope.operating_expenses_year = $scope.operating_expenses * 12;
         $scope.effective_market_rate = Number($scope.market_return) / 100;

         $scope.mt_management = ($scope.management == true) ? Number(Math.ceil($scope.rental_rate * 0.1)) : 0;
         $scope.mt_management_year = $scope.mt_management * 12;

         $scope.total_expenses = Number($scope.operating_expenses) + $scope.mt_management;
         $scope.total_expenses_year = $scope.total_expenses * 12;

         $scope.noi = Number($scope.rental_rate) - Number($scope.total_expenses);
         $scope.noi_year = $scope.noi * 12;

         $scope.cap_rate = ($scope.noi_year / $scope.mortgage_balance * 100).toFixed(2);

         $scope.performance_margin = ($scope.cap_rate / $scope.cap_target * 100).toFixed(2);

         $scope.ncf = $scope.noi - Number($scope.debt_service);
         $scope.ncf_year = $scope.ncf * 12;

         // Phase 2: Acquisition
         $scope.share_estimated_value = (1 / $scope.effective_market_rate) * $scope.company_target * 12;
         shares = $scope.getSharesFromCashflow($scope.noi);

         $scope.max_shares = shares['shares'];
         $scope.max_shares_value = shares['shares_value'];
         $scope.max_shares_cf = shares['cf_month'];
         $scope.max_shares_cf_year = shares['cf_year'];

         $scope.corp_margin = $scope.max_shares_value * $scope.company_minimum_perc / 100;
         $scope.corp_margin = ($scope.corp_margin < $scope.company_minimum_cash) ? $scope.company_minimum_cash : $scope.corp_margin;
         $scope.company_margin_perc = ($scope.corp_margin / $scope.max_shares_value * 100).toFixed(2);

         $scope.cash_needed = Number($scope.closing_costs) + Number($scope.mortgage_balance); // + $scope.corp_margin;
         $scope.effective_gap_points = $scope.getEffectiveRate($scope.gap_points);
         $scope.gap_costs = $scope.effective_gap_points * $scope.cash_needed;
         $scope.total_to_borrow = $scope.cash_needed + $scope.gap_costs;

         $scope.max_equity = $scope.max_shares_value - $scope.total_to_borrow - $scope.corp_margin;
         $scope.effective_max_equity = $scope.max_equity * ((100 - $scope.company_minimum_perc) / 100);

         if ($scope.seller_min_cashout > 0) {
            $scope.force_equity_compensation = true;
            shares = $scope.evaluateSellerMin();
         } else {
            shares = $scope.evaluateNormal();
         }

         $scope.owner_shares = shares['shares'];
         $scope.owner_shares_value = shares['shares_value'];
         $scope.owner_shares_cf = shares['cf_month'];
         $scope.owner_shares_cf_year = shares['cf_year'];

         $scope.ncf_diff = $scope.owner_shares_cf - $scope.ncf;
         $scope.ncf_diff_year = $scope.owner_shares_cf_year - $scope.ncf_year;
         $scope.ncf_years = $scope.owner_shares_value / $scope.ncf_year;

         max_corp_shares = $scope.max_shares - $scope.owner_shares;
         $scope.corp_shares = Math.ceil(((max_corp_shares * $scope.share_estimated_value) - $scope.total_to_borrow) / $scope.share_estimated_value);
         $scope.corp_shares_value = $scope.corp_shares * $scope.share_estimated_value;
         $scope.corp_shares_cf = $scope.corp_shares * $scope.company_target;
         $scope.corp_shares_cf_year = $scope.corp_shares_cf * 12;

         lender_shares = $scope.getSharesFromDollars($scope.total_to_borrow);
         $scope.lender_shares = lender_shares['shares'];
         $scope.lender_shares_value = lender_shares['shares_value'];
         $scope.lender_shares_cf = lender_shares['cf_month'];
         $scope.lender_shares_cf_year = lender_shares['cf_year'];

         $scope.corp_effective_percent = ($scope.corp_shares_value / $scope.max_shares_value * 100).toFixed(2);
         $scope.owner_effective_percent = ($scope.owner_shares_value / $scope.max_shares_value * 100).toFixed(2);
         $scope.lender_effective_percent = ($scope.total_to_borrow / $scope.max_shares_value * 100).toFixed(2);
         console.log($scope.exit_method);

         // Evaluation Phase:
         $scope.colorize($('#equity_target'), ($scope.equity_target > $scope.ncf_year * 3));
         $scope.colorize($('#cap_rate'), ($scope.cap_rate >= $scope.cap_target));
         $scope.colorize($('#ncf_years'), ($scope.ncf_years > 3));
         $scope.colorize($('#ncf_diff'), ($scope.ncf_diff >= 0));
         $scope.colorize($('#owner_shares'), ($scope.exit_method != "ce-fcf"));
      }

      $scope.evaluateSellerMin = function() {
         shares = $scope.getSharesFromDollars($scope.seller_min_cashout);

         $scope.exit_method = "sm-fe-ccf";
         if (shares['shares_value'] > $scope.effective_max_equity) {
            shares = $scope.evaluateNormal;
         }

         return shares;
      }

      $scope.evaluateNormal = function() {
         shares = $scope.getSharesFromDollars($scope.effective_max_equity);
            
         if (shares['cf_month'] >= $scope.ncf) {
            if ($scope.force_equity_compensation) {
               shares = $scope.getSharesFromCashflow($scope.ncf);
               $scope.exit_method = "ce-fcf";

            } else {
               $scope.exit_method = "fe-fcf";
            }
         }

         if (shares['cf_month'] < $scope.ncf) {
            $scope.exit_method = "fe-ccf";
         }

         return shares;
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

      $scope.calculate();
   }]);
