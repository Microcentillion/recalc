<?php

   $config_file = "./campaign_config.json";

   // END USER CONFIG //

   global $config, $arv, $taxes, $rental_rate;
   
   $config = json_decode(file_get_contents($config_file), true);
   $arv = $argv[1];
   $taxes = $argv[2];
   $rental_rate = $argv[3];
   
   function floorTo500($num) {
      return $num - ($num % 500);
   }
   
   function calcNOI() {
      global $config, $arv, $taxes, $rental_rate;
      
      return $rental_rate - ceil($taxes / 12) - ceil($rental_rate * ($config['maintenance'] + $config['vacancy'])) - $config['add_expenses'];
   }
   
   function calcAmPayment($balance, $rate, $term) {
      return payment($rate, $term * 12, $balance);
   }
   
   function calcIntPayment($balance, $rate) {
      return ceil($balance * $rate / 12);
   }
   
   function payment($apr,$n,$pv,$fv=0.0,$prec=0) {
      /* Calculates the monthly payment rouned to the nearest penny
      ** $apr = the annual percentage rate of the loan.
      ** $n = number of monthly payments (360 for a 30year loan)
      ** $pv = present value or principal of the loan
      ** $fv = future value of the loan
      ** $prec = the precision you wish rounded to
      
      
      *****************************************\
      ** No Warranty is expressed or implied. **
      *****************************************/
      
      if ($apr !=0) {
         $alpha = 1/(1+$apr/12);
         $retval = round($pv * (1 - $alpha) / $alpha /
         (1 - pow($alpha,$n)),$prec) ;
      } else {
         $retval = round($pv / $n, $prec);
      }

      return($retval);
   }

?>
