<!doctype html>
<!--
Copyright (c) 2012 Andrew Downing

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
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
  echo("</table>Failed to connect to MySQL: " . $con->connect_error);
}
else {
  $res = $con->query("select * from High_scores order by score desc");
  $res->data_seek(0);
  for ($i = 0; $i < 5 && $row = $res->fetch_assoc(); $i++) {
    echo("<tr><td>" . $row["name"] . "</td><td>" . $row["score"] . "</td></tr>");
  }
  echo("</table>");
}
        ?>
      </div>
      <a href="index.htm"><div class="button" style="background-image: url('img/button0.png')">Main Menu</div></a>
    </div>
  </body>
</html>
