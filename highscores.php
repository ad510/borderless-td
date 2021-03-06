<!doctype html>
<html>
  <head>
    <title>Borderless TD</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
<!--
Copyright (c) 2012 Andrew Downing

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
    <link rel="stylesheet" type="text/css" href="menu.css"/>
  </head>
  <body>
    <div class="back">
      <div class="title">High Scores</div>
      <div class="content">
        <!-- setting table column widths described at http://stackoverflow.com/questions/446624/table-cell-widths-fixing-width-wrapping-truncating-long-words -->
        <table style="width: 330px; table-layout: fixed">
          <tr>
            <th style="width: 250px">Name</th>
            <th style="width: 80px">Seconds Lasted</th>
          </tr>
        <?php
// connect to database
$con = new mysqli("localhost", "root", "5xvhK5zBC1", "borderless_td");
if ($con->connect_errno) {
  echo("</table>Failed to connect to MySQL: " . $con->connect_error);
}
else {
  // generate HTML table with top 5 high scores
  $res = $con->query("select * from High_scores order by score desc");
  $res->data_seek(0);
  for ($i = 0; $i < 5 && $row = $res->fetch_assoc(); $i++) {
    echo("<tr><td style=\"width: 250px\">" . $row["name"] . "</td><td style=\"width: 80px\">" . $row["score"] . "</td></tr>");
  }
  echo("</table>");
}
        ?>
      </div>
      <a href="index.htm"><div class="button" style="background-image: url('img/button0.png')">Main Menu</div></a>
    </div>
  </body>
</html>
