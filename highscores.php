<!doctype html>
<html>
  <head>
    <title>Borderless TD</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <link rel="stylesheet" type="text/css" href="menu.css"/>
  </head>
  <body>
    <div class="back">
      <div class="title">High Scores</div>
      <div class="content">
        <table>
          <tr>
            <th>Name</th>
            <th>Seconds Lasted</th>
          </tr>
        <?php
$con = new mysqli("localhost", "root", "5xvhK5zBC1", "borderless_td");
if ($con->connect_errno) {
  die("Failed to connect to MySQL: " . $con->connect_error);
}
$res = $con->query("select * from High_scores order by score desc");
$res->data_seek(0);
for ($i = 0; $i < 5 && $row = $res->fetch_assoc(); $i++) {
  echo("<tr><td>" . $row["name"] . "</td><td>" . $row["score"] . "</td></tr>");
}
        ?>
        </table>
      </div>
      <a href="index.htm"><div class="button" style="background-image: url('img/button0.png')">Main Menu</div></a>
    </div>
  </body>
</html>
