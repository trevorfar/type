import random
import time
import msvcrt

def wait_for_keypress():
    """Wait for a single key press, return lowercase char."""
    while True:
        if msvcrt.kbhit():
            key = msvcrt.getwch()
            return key.lower()

def main():
    letters = [chr(i) for i in range(97, 123)]  # a–z
    random.shuffle(letters)

    print("\n=== Reaction Time Calibration ===")
    print("When a letter appears, press it as fast as you can!\n")
    input("Press Enter to begin...")

    results = []
    print("\nStarting...\n")
    time.sleep(1)

    for letter in letters:
        print(f"\nGet ready for next letter...")
        time.sleep(random.uniform(1.0, 2.5))  # random wait before showing

        print(f"\n>>> {letter.upper()} <<<")
        start = time.perf_counter()

        while True:
            key = wait_for_keypress()
            if key == letter:
                elapsed = (time.perf_counter() - start) * 1000  # ms
                results.append((letter, elapsed))
                print(f"Good! {elapsed:.0f} ms")
                break
            else:
                print("Wrong key! Try again.")

    print("\n=== Results ===")
    total = 0
    for letter, ms in results:
        total += ms
        print(f"{letter.upper()} : {ms:.0f} ms")

    avg = total / len(results)
    print(f"\nAverage reaction time: {avg:.1f} ms")
    print("================================")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nExiting...")
