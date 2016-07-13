/*Library name:  MorfsotDataTable
 * Author:  Morfat Mosoti Ogega, https://morfatmosoti.com, morfatmosoti@gmail.com
 * Target:  Extends The DataTables library and adds EDIT,DELETE,CREATE functionality 
 *   which in the main library is proprietary
 * Last Revised: June 22nd 2016
 * 
 * Requirements:   jquery,datatables and its plugins, toastr and notify plugin
 * 
  */
function MorfsotDataTable(ajaxUrl,displayColumns,dataExportButtons,dataManipulationButtons,columnIdentifier,orderableColumn)
        {
	var self=this;
	
	/* initial */
	 self.table=null;
	 self.dataExportButtons=dataExportButtons; //for exporting rows to external formatse.g pdf,excel,csv,print
	 self.dataManipulationButtons=dataManipulationButtons; //i.e update,delete,create,refresh 
	 self.displayColumns=displayColumns; 
	 self.displayColumnsDict=[]; //dictrionary based columns format for table presentation
	 self.ajaxUrl=ajaxUrl;   //default Url to retrieve data on table load
	 self.columnIdentifier=columnIdentifier; //database unique identifier of records displayed. must be returned in retrieved data
	 self.orderableColumn=orderableColumn; //default column that will enable data be ordered in table on refresh
	 
	 
	/* css classes */
	 self.tableClass='.morfsot-datatable';
	 self.buttonsClass='.morfsot-datatable-buttons';
	 self.searchClass='.morfsot-datatable-search';
	 self.paginationClass='.morfsot-datatable-pagination';
	
	 /* data */
	 self.jsonResponseData=null; //returned json from every ajax request
	 //self.selectedRowsId=null; //hold ids for row selected 
	 self.selectedRowsData=null;
	 self.selectedRowsCount=0;
	 
	 //self.selectedRowId=null; //hold id for row selected 
	 //self.selectedRowData=null;
	 
	/* data manipulation definations */
	
	self.createModalId='#morfsot-datatable-create-modal';
	self.createUrl=null; //url for form submission on saving new data
	self.createFormClass='.morfsot-datatable-create-form'; //class for form for creating new data
	self.formProgressClass='.morfsot-datatable-form-progress'; //to show progrss in data submission
	
	
	self.updateModalId='#morfsot-datatable-update-modal';
	self.updateUrl=null; //url for form submission on saving new data
	self.updateFormClass='.morfsot-datatable-update-form'; //class for form for editting new data
	
	self.deleteModalId='#morfsot-datatable-delete-modal';
	self.deleteUrl=null; //url for form submission on saving new data
	self.deleteFormClass='.morfsot-datatable-delete-form'; //class for form deleting data
	
	
    /*===============start =============== */
   
   
   // initialize columns for display 
   for (i=0; i<self.displayColumns.length; i++){self.displayColumnsDict.push({'data':self.displayColumns[i]});}
	   
	   
   //initialize table .
   self.table=$(self.tableClass).DataTable({
        "paging":false,
        //"ordering":false,
        "filter":false,
        "processing":true,
        "language":{
        	 "loadingRecords": "Loading data ... ",
             "processing":     '<p  style="color:green;"><strong><i class="fa fa-circle-o-notch fa-spin fa-2x"></i>\
                                   Processing ... Please wait ... </p></strong></div>',
        },
        "info":false,
        "scrollX":true, //enable horizontal scrolling for large data
        "ajax":self.ajaxUrl,  //url that returns json response from server
        "columns":self.displayColumnsDict,  //columns for display in <td> </td>
        rowId:self.columnIdentifier, //for identifying the rwo.this id value must be in returned json
        //"deferRender":true, //make table <tr> to be created as needed .
        /*select: {
            style:    'os', //os-> multiple, single-> single
            },
       */
       select:true,
       order: [[ self.orderableColumn, 'asc' ]], //ordering by ascending
       dom: 'Bfrtip',
       buttons: (self.dataExportButtons.length>0) ? def_val : ['csv'], 
       //the list must be in buttons: ['excel','print','pdf','csv','selectAll','selectNone']
 }); //end table initialization
 
    /* functions */
function initializeFormWithData(form,data){
    	//this pupulates form with data fields and then displays
    	$.each(data,function(name,val){
    		var $el=$('[name="'+name+'"]',form); //get form element
    		switch($el.attr('type')){
    			case 'checkbox':
    			$el.attr('checked','checked');
    			break;
    		    case 'radio':
    		    $el.filter('[value="'+val+'"]').attr('checked','checked');
    		    break;
    		    default:
    		    $el.val(val);
    		}
    	});
    }//initializeFormWithData
    
    
function showSubmittedFormErrors(form,errors){
    	//this pupulates form with data fields errors and then displays
    	$.each(errors,function(name,val){
    		var $el=$('[name="'+name+'"]',form); //get form element
    		$el.parent('div').addClass('has-error'); //requires bootstrap 
    		
    		var div_id='"'+name+'__error"';
    		
			$el.parent('div').append('<div id='+div_id+'><p style="color:red;">'+val+'</p></div>');    		
    	});
    }//showSubmittedFormErrors
    
function removeSubmittedFormErrors(form,data){
    	//this removes errors from form
    	$.each(data,function(id,object){ //loop over serialized form data
    		
    		var $el=$('[name="'+object.name+'"]',form); //get form element
    		$el.parent('div').removeClass('has-error');
    		var div_id='#'+object.name+'__error';
    		$(div_id).remove();  	//remove error divs
    		
    		
    	});
    }//removeSubmittedFormErrors
    
    
function  createDataManipulationButtons(){
    	//add manipulation buttons to the table
   for (i=0; i<self.dataManipulationButtons.length; i++ ){
   	if (self.dataManipulationButtons[i]==='create'){
   		
   		//create button
           self.table.button().add( 0, {
            action: function ( e, dt, button, config ) {
              $(self.createFormClass)[0].reset(); //if form class for create and update is shared, reset
              $(self.createModalId).modal('show'); //show modal with form
               },
           text: 'Create',
           className:'morfsot-datatable-buttons-create'} );
   	}
   	else if (self.dataManipulationButtons[i]==='update'){
   		
   		//edit update button
           self.table.button().add( 1, {
            action: function ( e, dt, button, config ) {
            	//console.log(self.selectedRowsData);
               self.initializeFormWithData($(self.updateFormClass)[0], self.selectedRowsData[0]);  //initialize form with selected row data
               $(self.updateModalId).modal('show'); //show modal with form for update action
               
               },
           text: 'Update',
           className:'morfsot-datatable-buttons-update'} );
           
   	}
   	else if (self.dataManipulationButtons[i]==='delete'){
   		
   		//delete update button
   		
          self.table.button().add( 2, {
            action: function ( e, dt, button, config ) {
            	
            	 //initialize form with selected row data
             self.initializeFormWithData($(self.deleteFormClass)[0], self.selectedRowsData[0]); 
             
             $(self.deleteModalId).modal('show'); //show modal with form for delete
        
               },
           text: 'Delete',
           className:'morfsot-datatable-buttons-delete'} );
           
   	}
   	
   	
   	else if (self.dataManipulationButtons[i]==='refresh'){
   		
   		//create refresh button
   		//create button
           self.table.button().add( 3, {
            action: function ( e, dt, button, config ) {
             //alert("create new ");
             dt.ajax.reload();
           
               },
           text: 'Refresh',
           className:'morfsot-datatable-buttons-refresh'} );
           
   	}
   	

      }//end for loop
   
   //avail to table
   //place buttons to buttons class div
 self.table.buttons( 0, null ).containers().appendTo( self.buttonsClass );
 self.table.buttons(['.morfsot-datatable-buttons-update','.morfsot-datatable-buttons-delete']).disable();

 
}//close function


    function getSelectedRowsData(){
    	return self.selectedRowsData;
    }	
    
    
    function reloadTable(){
    	self.table.ajax.reload();
    }
    
    
    function getSelectedRowsColumn(column_name='id'){
    	//return array of selected colum specified.
    	var data=[];
    	 for(i=0;i<self.getSelectedRowsData().length;i++){
         data.push(self.getSelectedRowsData()[i][column_name]);
            }
            return data;
    }
    
    
    function addRowToTable(rowData){
    	//add row to created table
    	self.table.row.add(rowData).draw(); 
    }
    
    
    //after pagination has been set, lets draw the html.
function createPagination(){
	//for None or null do not display links.
	//pagination should returns none or null pages if not available
	
	//uses set pagination data
	var pagination=self.jsonResponseData.pagination;
	var prev='';
	var next='';
	
	if (pagination.previous_page){
		//console.log(pagination.previous_page);
		prev='<li><a href="#" class="pagination-previous" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
	}
	
	if (pagination.next_page){
		//console.log(pagination.next_page);
		next='<li><a href="#" class="pagination-next" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
	}
	
	
	$(self.paginationClass).html('<nav><ul class="pagination">'+prev+'\
    <li><a href="javascript:void(0);">Page '+pagination.current_page+' of '+pagination.total_pages+'</a></li>\
    '+next+'</ul></nav>');
    
	
}//end function create_pagination


 function spinner(state){
   	//shwo progess. alos activates or deactivates submit button
   	
   	if (state=='show'){
   		$(self.formProgressClass).html('<h4>\
	<i class="fa fa-circle-o-notch fa-spin fa-lg"></i>\
<span class="sr-only">Loading...</span> Processing ... Please wait ... </h4>');

//deactivate submit button
 $(".morfsot-datatable-submit").attr("disabled", true);   
     
   	}else{
   		$(self.formProgressClass).html(" ");
   		//activate submit button
         $(".morfsot-datatable-submit").attr("disabled", false); 
   	}
   	
   	
   }//end spinner
   
   

	 
/* ===initialize === */

//implement search
$(self.searchClass).append('<input type="text" class="form-control search_value" name="search_value" placeholder="Search !" />');
//create buttons
createDataManipulationButtons();
     
     
    

 /* ==========  events  and actions ==== */
//form submit

//create form
$(self.createFormClass).submit(function(event){
	//stop normal submit
	event.preventDefault();
	//get our form
	var form=$(this);
	self.spinner('show');
	var form_data=form.serializeArray();
	//remove previus form errors before sending 
	self.removeSubmittedFormErrors(form,form_data);
	
	var form_posting=$.post(self.createUrl,form.serialize());
	//handle processes
	form_posting.done(function(jsonResponse){
		//show success or error  message. this function depends on toastr.js and notify.js. make sure is included
		
		//check if error or data
		if (jsonResponse.hasOwnProperty('data')){
			//successfully done. display
			notify('success','Notification','Successful');
		    form[0].reset();
		    //close modal
		    $(self.createModalId).modal('hide');
		    //we were adding. hence update table with new row
		    self.addRowToTable(jsonResponse.data);
		}else if (jsonResponse.hasOwnProperty('errors')){
			notify('error','Notification','Failed. Please correct the errors below');
			self.showSubmittedFormErrors(form,jsonResponse.errors)
			//remove errors
		}else{
			notify('warning','Notification','Bad Json format returned.');
			
		}
	});
	
	form_posting.fail(function(data){
		//alert("failed");
		notify('error','Notification','Request Failed. Please try again');
		//self.removeSubmittedFormErrors(form,form_data);
		
	});
	
	form_posting.always(function(data){
		//clear progress div
		self.spinner('hide');		
	});
	
});// ./ end  form submit

/*  ==== update ==== */
$(self.updateFormClass).submit(function(event){
	//stop normal submit
	event.preventDefault();
	//get our form
	var form=$(this);
	self.spinner('show');
	var form_data=form.serializeArray();
	//remove previous form errors before sending 
	self.removeSubmittedFormErrors(form,form_data);
	
	var form_posting=$.post(self.updateUrl,form.serialize());
	//handle processes
	form_posting.done(function(jsonResponse){
		//show success or error  message. this function depends on toastr.js and notify.js. make sure is included
		
		//check if error or data
		if (jsonResponse.hasOwnProperty('data')){
			//may return data or can be empty. but by returning data it means it is succsessful.
			
			
			//successfully done. display
			notify('success','Notification','Successfully Updated ');
		    form[0].reset();
		    //close modal
		    $(self.updateModalId).modal('hide');
		    
		    //reload table to show changes.
		    self.reloadTable();
		    
		    
		    
		}else if (jsonResponse.hasOwnProperty('errors')){
			notify('error','Notification','Failed. Please correct the errors below');
			self.showSubmittedFormErrors(form,jsonResponse.errors)
			//remove errors
		}else{
			notify('warning','Notification','Bad Json format returned.');
			
		}
	});
	
	form_posting.fail(function(data){
		//alert("failed");
		notify('error','Notification','Request Failed. Please try again');
		//self.removeSubmittedFormErrors(form,form_data);
		
	});
	
	form_posting.always(function(data){
		//clear progress div
		self.spinner('hide');		
	});
	
});// ./ end  form submit

//end update form

/*   delete form  handling */ 


$(self.deleteFormClass).submit(function(event){
	//stop normal submit
	event.preventDefault();
	//get our form
	var form=$(this);
	self.spinner('show');
	var form_data=form.serializeArray();
	//remove previous form errors before sending 
	self.removeSubmittedFormErrors(form,form_data);
	
	var form_posting=$.post(self.deleteUrl,form.serialize());
	//handle processes
	form_posting.done(function(jsonResponse){
		//show success or error  message. this function depends on toastr.js and notify.js. make sure is included
		
		//check if error or data
		if (jsonResponse.hasOwnProperty('data')){
			//may return data or can be empty. but by returning data it means it is succsessful.
			//successfully done. display
			notify('success','Notification','Successfully Deleted');
		    form[0].reset();
		    //close modal
		    $(self.deleteModalId).modal('hide');
		    
		    //reload table to show changes.
		    self.reloadTable();
		    
		}else if (jsonResponse.hasOwnProperty('errors')){
			notify('error','Notification','Failed. Please try again later ');
			//remove errors
		}else{
			notify('warning','Notification','Bad Json format returned.');
			
		}
	});
	
	form_posting.fail(function(data){
		//alert("failed");
		notify('error','Notification','Request Failed. Please try again');
		//self.removeSubmittedFormErrors(form,form_data);
		
	});
	
	form_posting.always(function(data){
		//clear progress div
		self.spinner('hide');		
	});
	
});// ./ end  form submit


/*   end delete form handling */


//register more event listeners. on table
//select event
self.table.on('select',function(e,dt,type,indexes){
    self.selectedRowsData=self.table.rows( {selected:true} ).data();
  
    if (self.selectedRowsData.length!=1){
    	//if multiple rows selected, disable  update and delete btns
    	self.table.buttons(['.morfsot-datatable-buttons-update','.morfsot-datatable-buttons-delete']).disable();
    }else {
    	self.table.buttons(['.morfsot-datatable-buttons-update','.morfsot-datatable-buttons-delete']).enable();
    }
   
}); //end select

//deselect event
self.table.on('deselect',function(e,dt,type,indexes){
self.table.buttons(['.morfsot-datatable-buttons-update','.morfsot-datatable-buttons-delete']).disable();
}); //end deselect\n

//get returned ajax data after every ajax request.
 self.table.on( 'xhr', function () {
     self.jsonResponseData = self.table.ajax.json();
     //create pagination
     createPagination();
} );//end deselect


//register search handler event
$('.search_value').keyup(function(){
	//set table url and pull data immediately
	var new_ajax_url=self.ajaxUrl+'?search_value='+$(this).val();
	self.table.ajax.url(new_ajax_url).load();
	
});

//register pagination click handler event
//previous
$( "body" ).on( "click", ".pagination-previous", function(event) {
	event.preventDefault();
var new_ajax_url=self.ajaxUrl+'?page='+self.jsonResponseData.pagination.previous_page;
self.table.ajax.url(new_ajax_url).load();
});
//next
$( "body" ).on( "click", ".pagination-next", function(event) {
	event.preventDefault(); //avoid triggering page load on link
	var new_ajax_url=self.ajaxUrl+'?page='+self.jsonResponseData.pagination.next_page;
	self.table.ajax.url(new_ajax_url).load();
});


 /* == end events ===  */



//accessor definations for functions. this allow the functions to be called like any oop methods
self.addRowToTable=addRowToTable;
self.getSelectedRowsData=getSelectedRowsData;
self.initializeFormWithData=initializeFormWithData;
self.spinner=spinner;
self.getSelectedRowsColumn=getSelectedRowsColumn;
self.reloadTable=reloadTable;
self.showSubmittedFormErrors=showSubmittedFormErrors;
self.removeSubmittedFormErrors=removeSubmittedFormErrors;



}//end table ()


