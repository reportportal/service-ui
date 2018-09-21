export default `<?php
class C1 extends C2 implements I1, I2
{
  private $a;
  protected $b;

  function __construct($a, $b)
  {
    parent::__construct($a, $b);
    $this->a = $a;
    $this->b = $b;
  }

  public function plus()
  {
    return $this->a + $this->b;
  }
/* ............... */
}

$d = new C1(1, 2);
echo $d->plus(); // 3
?>`;
