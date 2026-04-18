from rag.pipeline import run_rag

while True:
    query = input("You: ")
    answer = run_rag(query)
    print("Assistant:", answer)