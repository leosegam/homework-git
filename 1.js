const input_one = document.getElementById('1')
const input_two = document.getElementById('2')
const select_operation = document.getElementById('operation')
const button_result = document.getElementById('=')
const input_tree = document.getElementById('result')


function calculator(){
    let num_1 = Number(input_one.value)
    let num_2 = Number(input_two.value)
    let operation = select_operation.value

    let res
    if (operation === "+"){
        res = num_1 + num_2
    } else if (operation === '-'){
        res = num_1 - num_2
    } else if (operation === "*"){
        res = num_1 * num_2
    } else if (operation === "/"){
        res = num_1 / num_2
    }
    input_tree.value = res
    console.log(res)
    
}
button_result.addEventListener('click', calculator)



