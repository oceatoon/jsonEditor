<div id="addSimpleElement">
    <?php if($_GET['type']=='object'){?>
	<label for="nodekey">Key</label>
     <input type="text" id="nodekey" name="nodekey"/>    
     <br/>
     <?php }?>
	<label for="nodeValue">Value</label>
	<textarea id="nodeValue" name="nodeValue" style="width:300px;height:100px;"></textarea>
</div>
<br/>
<a id="savebutton" class="btnclose" href="javascript:popinDialog.close();"> CANCEL </a>
<a id="savebutton" class="btnsave" href="javascript:;" onclick="tree.addSimpleElement(<?php echo $_GET['lvl']?> ,<?php echo $_GET['el']?> ,true);"> SAVE </a>

<script>
$(document).ready(function()
{
	$("a.btnsave ").button({ icons: {secondary:'ui-icon-disk'} }  );
	$("a.btnclose ").button({ icons: {secondary:'ui-icon-closethick'} }  );
});
</script>