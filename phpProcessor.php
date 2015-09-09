<?php
  // Grab the posted data from the AJAX POST method ($.post)
  $score = $_POST['score'];
  $name = $_POST['name'];
  
 
  // Validate the username submitted
  $id = array();
  $playerScore = array();
  $playerName = array();
  if(isset($score)) 
  {
  	
	$f = fopen('score.txt', 'r+');
	$highScore = fgets($f);
	if ($score > $highScore)
	{
		fseek($f, 0);	
		fputs($f, $score);
		echo $score;
	}
	else echo  $highScore;
	fclose($f);
	/*
	for($i = 0; $i < i; $i++)
	{
		$line = fgets($f);
		$tmp = explode("," , $line);
		$id[] = $tmp[0];
		$playerScore[] = $tmp[1];
		$playerName[] = $tmp[2];
		
	}
	
	for($i = 0; $i < 5; $i++)
	{
		if($score > $playerScore[$i])
		{
			$tmpS = array();
			$tmpS[] = 0;
			$tmpS[] = 0;
			$tmpN = array();
			$tmpN[] = "";
			$tmpN[] = "";
			
			$tmpS[$i%2] = $playerScore[$i];
			$playerScore[$i] = $score;
			$tmpN[$i%2] = $playerName[$i];
			$playerName[$i] = $name;
			for($j = $i+1 ; $j < 5; $j++)
			{
				$tmpS[$j%2] = $playerScore[$j];
				$playerScore[$j] = $tmpS[($j%2)+1];
				$tmpN[$j%2] = $playerName[$j];
				$playerName[$j] = $tmpN[($j%2)+1];
					
			}
			break;
		}
	}*/
	
  }
   
  else 
  {
    $f = fopen('score.txt', 'r+');
	$highScore = fgets($f);
	echo $highScore;
	fclose($f);
  }
?>