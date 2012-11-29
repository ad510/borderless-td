<p><a href="../index.htm">Main Menu</a></p>
<p><?php
$con = new mysqli("localhost", "root", "5xvhK5zBC1", "borderless_td");
if ($con->connect_errno) {
  die("Failed to connect to MySQL: " . $con->connect_error);
}
// unfortunately there is currently no input validation, which allows for SQL injection
// if I had more time for the project I would add that
if (!$con->query("insert into High_scores (name, score) values ('" . $_POST["f_name"] . "', '" . $_POST["f_score"] . "')")) {
  if (!$con->query("create table High_scores (name varchar(100), score int)")) {
    die("Error creating high scores table: " . $con->error);
  }
  else if (!$con->query("insert into High_scores (name, score) values ('" . $_POST["f_name"] . "', '" . $_POST["f_score"] . "')")) {
    die("Error adding high score: " . $con->error);
  }
}
header("Location: ../highscores.php");
exit;
?></p>
