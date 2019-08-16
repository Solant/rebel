#include <fstream>

int main() {
	int32_t a = 23;
	std::ofstream file("test.bin", std::ios::out | std::ios::binary);
	file.write((char*) &a, sizeof(int32_t));
	file.write((char*) &a, sizeof(int32_t));
	file.close();
}
