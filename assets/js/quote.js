$(document).ready(function () 
{
    $("#numElev_2, #numElev_3, #elevPriceUnit, #elevTotal, #installationFee, #total_").attr('readonly', true);

    var numApp, numFloors, numBase, maxOcc;
    var prodRange = 
    {
        type: null,
        price: null,
        installationFeePercentage: null,
    }

    $('.formField').on('keyup', function () 
    {
        doCalc();
    })


    //At least it's more specific and fixes the problem where only the standard price is displayed! But it's hideous.
    $('#standard').on('click', function () 
    {
        document.getElementById('elevPriceUnit').value = (7565).toFixed(2) + " $";
        doCalc();
    })

    $('#premium').on('click', function () 
    {
        document.getElementById('elevPriceUnit').value = (12345).toFixed(2) + " $";
        doCalc();
    })

    $('#excelium').on('click', function () 
    {
        document.getElementById('elevPriceUnit').value = (15400).toFixed(2) + " $";
        doCalc();
    })

    $('#residential, #commercial, #corporate, #hybrid').on('click', function ()
    {
        initialize();
    })


    function initialize() 
    {
        $('.formField').val('');
        $('.productRangeBtn').prop('checked', false);
    }
    //Appartments
    function getInfoNumApp() 
    {
        numApp = $('#numApp').val();
    }
    //Floors
    function getInfoNumFloors() 
    {
        numFloors = $('#numFloors').val();
    }
    //Basements
    function getInfoNumBase() 
    {
        numBase = $('#numBase').val();
    }
    //Elevator shafts
    function getInfoNumElev() 
    {
        numElev = $('#numElev').val();
    }
    //Occupancy
    function getInfoMaxOcc() 
    {
        maxOcc = $('#maxOcc').val();
    }

    //Product range
    function getProdRange() 
    {
        if ($('#standard').is(':checked')) 
        
        {
            prodRange.type = "standard";
            prodRange.price = parseFloat(7565);
            prodRange.installationFeePercentage = 0.1;
            return prodRange;

        } else if ($('#premium').is(':checked')) 
        
        {
            prodRange.type = "premium";
            prodRange.price = parseFloat(12345);
            prodRange.installationFeePercentage = 0.13;
            return prodRange;

        } else if ($('#excelium').is(':checked')) 
        
        {
            prodRange.type = "excelium";
            prodRange.price = parseFloat(15400);
            prodRange.installationFeePercentage = 0.16;
            return prodRange;
        } else 
        
        {
            prodRange.type = null;
            prodRange.price = null;
            prodRange.installationFeePercentage = null;
            return prodRange;
        }
    }

    //This function seems to be the one giving the numbers to the final result fields. More tracking needed to fully understand.
    function GetInfos() 
    {
        getInfoNumApp();
        getInfoNumFloors();
        getInfoNumBase();
        getInfoNumElev();
        getInfoMaxOcc();
        getProdRange();
    }

    //NaN fault by specifying it is a Number
    function setRequiredElevatorsResult(finNumElev) 
    {
        $("#numElev_2, #numElev_3").val(parseFloat(Number(finNumElev)));
    }

    //NaN faults fixed by specifying that it is a Number
    function setPricesResults(roughTotal, installFee, total) 
    {
        $("#elevTotal").val(parseFloat(Number(roughTotal)).toFixed(2) + " $"); 
        $("#installationFee").val(parseFloat(Number(installFee)).toFixed(2) + " $");
        $("#total_").val(parseFloat(Number(total)).toFixed(2) + " $");
    }

    function emptyElevatorsNumberAndPricesFields() 
    {
        $('#numElev_3').val('');
        $('.priceField').val('');
        $("#numElev_2").val("");
    }

    function createFormData(projectType) 
    {
        return {
            numberApp: numApp,
            numberFloors: numFloors,
            numberBase: numBase,
            maximumOcc: maxOcc,
            productRange: prodRange,
            projectType: projectType
        }
    }
    //If you arrange {blocks of codes like these} in this way it is easier to determine where to put additional code.
    function negativeValues() 
    {
        if ($('#numApp').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numApp').val('');
            return true
        }
        //Added additional condition to check if the Floor number is negative.
        else if ($("#numFloors").val() < 0)
        {
            alert("Please enter a positive number!");
            $("#numFloors").val("");
            return true
        }

        else if ($('#numBase').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numBase').val('');
            return true
        }

        else if ($('#numComp').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numComp').val('');
            return true
        }

        else if ($('#numPark').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numPark').val('');
            return true
        }

        else if ($('#numElev').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numElev').val('');
            return true
        }

        else if ($('#numCorpo').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#numCorpo').val('');
            return true
        }

        else if ($('#maxOcc').val() < 0) 
        {
            alert("Please enter a positive number!");
            $('#maxOcc').val('');
            return true
        }

        else 
        {
            return false
        }
    }

    function apiCall(projectType) 
    {
        //Getting numbers from quote
        GetInfos();

        //Preparing data for Api call
        formData = createFormData(projectType)

        $.ajax(
        {
            type: "POST",
            // url: 'http://localhost:3000/api/quoteCalculation/', //for local testing
            url: 'https://rocketelevators-quote.herokuapp.com/api/quoteCalculation/',
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) 
            {
                setRequiredElevatorsResult(data.finalNumElev);
                if (prodRange.type != null) 
                {
                    setPricesResults(data.finalNumElev, data.subTotal, data.installationFee, data.grandTotal);
                }
            }
        })
    }
    
    //more readable this way.
    function doCalc() 
    {
        if ($('#residential').hasClass('active') && 
        !negativeValues() && 
        $('#numApp').val() &&
        $('#numFloors').val())
        {
            apiCall('residential');
        }

        else if ($('#commercial').hasClass('active') &&
        !negativeValues() && 
        $('#numElev').val() 
        /* $('#numPark').val()*/) //This instruction prevented from calculation to be fired when N. of Shafts had an input.
        {
            apiCall('commercial');
        }

        else if ($('#corporate').hasClass('active') &&
        !negativeValues() &&
        $('#numFloors').val() &&
        $('#numBase').val() &&
        $('#maxOcc').val()) 
        {
            apiCall('corporate'); //Wrong specifications fixed from commercial to corporate
        }

        else if ($("#hybrid").hasClass("active") &&
        !negativeValues() &&
        $("#numFloors").val() &&
        $("#numBase").val() &&
        $("#maxOcc").val())
        {
            apiCall("corporate"); //Hybrid buildings have the same calculation function than corporate.
        }

        else 
        {
            emptyElevatorsNumberAndPricesFields();
        }
    }
})
