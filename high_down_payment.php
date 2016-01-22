<?php

   require_once('config.php');
   
   $noi = calcNOI();
   $config['hold_time'] = 0;
   
   $effective_rate = 1 / (1 - (($config['hold_time'] / 12 * $config['lender_rate']) + $config['lender_points'])) - 1;
   $upfront_costs = $config['closing_costs'] + $config['repairs'] + $config['acquisition_fee'];
   $down_payment = floorTo500($arv * $config['upg_down_payment']);
   
   $works = false;
   $attempt = 0;
   while (!$works) {
      $total_cost_to_buy = $upfront_costs + $down_payment;
      $pm_costs = ceil(($total_cost_to_buy - $config['my_cash']) * $effective_rate);
      $amount_to_borrow = $pm_costs + $total_cost_to_buy - $config['my_cash'];
      $pm_payment = calcAmPayment($amount_to_borrow, $config['lender_rate'], 30);
      
      $my_monthly_ncf = (($config['my_cash'] * $config['my_min_coc'] < $config['my_min_ncf']) ? $config['my_min_ncf'] : $config['my_cash'] * $config['my_min_coc']);
      //$my_monthly_ncf = $config['my_cash'] * $config['my_min_coc'];
      $payment_to_seller = $noi - $pm_payment - $my_monthly_ncf;
      
      if ($payment_to_seller > 0) {
         $works = true;
      } else {
         $down_payment = $down_payment * 0.8;
         $attempt++;
      }
      
      if ($attempt > 4) {
         die('Too many attempts');
      }
   }
   
   $net_from_payments = $payment_to_seller * $config['upg_balloon_year'] * 12;
   $appreciation_percent = ($config['upg_balloon_year'] > 3) ? pow($config['value_app'], $config['upg_balloon_year'] - 3) : 1;
   $exit_arv = floorTo500($arv * $appreciation_percent);
   $max_balloon = $exit_arv * 0.75 - $down_payment;
   
   echo "Costs to buy: " . $upfront_costs . "\n";
   echo "Down: " . $down_payment . "\n";
   echo "Roll-in: " . $pm_costs . "\n";
   echo "Total to Borrow: " . $amount_to_borrow . "\n\n";
   
   echo "NOI: " . $noi . "\n";
   echo "PM Payment: " . $pm_payment . "\n";
   echo "Seller Payment: " . $payment_to_seller . "\n";
   echo "My NCF: " . $my_monthly_ncf . "\n";
   
   echo "Exit ARV: " . $exit_arv . "\n";
   echo "Max Balloon: " . $max_balloon . "\n";
   
   
   
?>
