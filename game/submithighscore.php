<!--
Copyright (c) 2012 Andrew Downing

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<p><a href="../index.htm">Main Menu</a></p>
<p><?php
$con = new mysqli("localhost", "root", "5xvhK5zBC1", "borderless_td");
if ($con->connect_errno) {
  die("Failed to connect to MySQL: " . $con->connect_error);
}
if (!preg_match("/^[a-zA-Z ]+$/", $_POST["f_name"])) {
  die("Name may only contain letters or spaces");
}
else if (!preg_match("/^[0-9]+$/", $_POST["f_score"])) {
  die("Score may only contain digits");
}
else if (!$con->query("insert into High_scores (name, score) values ('" . $_POST["f_name"] . "', '" . $_POST["f_score"] . "')")) {
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
