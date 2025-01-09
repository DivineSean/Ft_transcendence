list = ["x" , "0" , "0" , "x" , "0", "0"]
flag = 0 
i = 0
for i in range(0, len(list), 1):
    
    if i+1 < len(list):
        if list[i] == "x":
            if list[i + 1] == "x":
                print("get them to gameRoom")
            else:
                print(f"forfait {i}")
                flag = 1
                
        else:   
            if flag == 1:
                flag = 0
            else:
                if list[i + 1] == "0":
                    pass
                else:
                    print("x")
                    print(f"forfait {i + 1 }")
                
